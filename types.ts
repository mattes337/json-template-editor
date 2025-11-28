export interface VariableNode {
  key: string;
  path: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  value: any;
  children?: VariableNode[];
}

export interface EditorState {
  template: string;
  testData: string;
  parsedTestData: Record<string, any>;
  mode: 'edit' | 'preview';
  compileError: string | null;
}

export type DragItem = {
  path: string;
  type: string;
};

export interface UserFunction {
  id: string;
  name: string;
  args: string[];
  body: string;
}