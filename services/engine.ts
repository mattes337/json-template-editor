import Handlebars from 'handlebars';

// Register a "js" helper to allow inline JavaScript execution
// WARNING: usage of Function() implies security risks if templates are untrusted.
// In a real prod environment, use a sandboxed evaluator like vm2 or quickjs-emscripten.
Handlebars.registerHelper('js', function(options) {
  const context = options.data.root;
  const expression = options.fn(this);
  
  try {
    // Create a safe-ish function that has access to 'context'
    // eslint-disable-next-line
    const func = new Function('context', 'Math', 'Date', `return (${expression});`);
    return func(context, Math, Date);
  } catch (e: any) {
    return `[Error: ${e.message}]`;
  }
});

Handlebars.registerHelper('toJson', function(context) {
  return JSON.stringify(context);
});

export const compileTemplate = (template: string, data: Record<string, any>): string => {
  try {
    const compiled = Handlebars.compile(template);
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
