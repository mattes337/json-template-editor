import Handlebars from 'handlebars';
import { UserFunction } from '../types';

// Register a "js" helper to allow inline JavaScript execution
// WARNING: usage of Function() implies security risks if templates are untrusted.
// In a real prod environment, use a sandboxed evaluator like vm2 or quickjs-emscripten.

export const compileTemplate = (template: string, data: Record<string, any>, functions: UserFunction[] = []): string => {
  try {
    // Create an isolated Handlebars environment for this compilation
    const hb = Handlebars.create();
    
    // 1. Prepare User Functions for Injection into JS Scope
    const userFuncMap: Record<string, Function> = {};
    functions.forEach(fn => {
        try {
            // eslint-disable-next-line no-new-func
            userFuncMap[fn.name] = new Function(...fn.args, fn.body);
        } catch (e) {
            console.warn(`Failed to compile user function [${fn.name}]:`, e);
        }
    });

    const userFuncNames = Object.keys(userFuncMap);
    const userFuncImpls = userFuncNames.map(name => userFuncMap[name]);

    // 2. Register 'js' helper that includes user functions in its scope
    // Supports block usage: {{#js}} context.val > 10 {{/js}}
    // Supports inline usage: {{js "context.val > 10"}}
    hb.registerHelper('js', function(...args) {
      const options = args[args.length - 1];
      const context = options.data.root;
      const scope = this; // The current Handlebars context (e.g. inside an #each loop)
      
      let expression = '';

      if (typeof options.fn === 'function') {
        expression = options.fn(this);
      } else if (args.length > 1) {
        expression = args[0];
      }
      
      try {
        // Create a function with arguments for context, scope, Math, Date, and all user functions
        // eslint-disable-next-line no-new-func
        const func = new Function(
            'context', 
            'scope',
            'Math', 
            'Date', 
            ...userFuncNames, 
            `return (${expression});`
        );
        // Execute the function with the context, scope, standard libs, and user functions
        return func(context, scope, Math, Date, ...userFuncImpls);
      } catch (e: any) {
        return `[Error: ${e.message}]`;
      }
    });

    // 3. Register 'toJson' helper
    hb.registerHelper('toJson', function(context) {
      return JSON.stringify(context);
    });

    // 4. Register user functions as standard Handlebars helpers as well
    // This allows for {{ func arg }} usage in addition to {{#js}} func(arg) {{/js}}
    functions.forEach(fn => {
      if (!hb.helpers[fn.name]) { // Prevent overriding core helpers
          hb.registerHelper(fn.name, function(...args) {
            // Handlebars passes 'options' as the last argument, remove it
            const userArgs = args.slice(0, -1);
            if (userFuncMap[fn.name]) {
                try {
                    return userFuncMap[fn.name](...userArgs);
                } catch (e: any) {
                    return `[Error in ${fn.name}: ${e.message}]`;
                }
            }
          });
      }
    });

    const compiled = hb.compile(template);
    return compiled(data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const formatJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return jsonString; // Return raw if invalid JSON
  }
};