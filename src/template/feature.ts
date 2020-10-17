import { pascalCase } from "change-case";

export const featureTemplate = (f: string) => {
  const FeatureName = pascalCase(f);
  const Props = `${FeatureName}Props`;

  return `
    import React from 'react';
    import {${Props}} from './${f}.type';
  
    const ${FeatureName}:React.FC<${Props}> =() =>{
      return (
        <div>we are in ${FeatureName} page</div>
      )
      }

    export default ${FeatureName};
    `;
};
