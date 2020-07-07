import * as changeCase from "change-case";

export const typeTemplate = (f: string) => {
  const FeatureName = changeCase.pascalCase(f);

  return `
  export interface ${FeatureName}Props{

  }
`;
};
