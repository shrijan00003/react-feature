import * as changeCase from "change-case";

export const contextTypescript = (f: string) => {
  const FeatureName = changeCase.pascalCase(f);
  const featureName = changeCase.camelCase(f);

  return `
import React, { createContext } from 'react';


interface ${FeatureName}ProviderProps {
  children: React.ReactNode;
}

type Dispatch = (action: any) => void;

interface ${FeatureName}Props {
  
}

const initialState: ${FeatureName}Props = {
  
};

const ${FeatureName}StateContext = createContext<${FeatureName}Props | undefined>(undefined);
const ${FeatureName}DispatchContext = createContext<Dispatch | undefined>(undefined);

function ${featureName}Reducer(state: ${FeatureName}Props, action: any) {

  switch (action.type) {
    case 'TYPE': {
      return { ...state};
    }
   
    default: {
      throw new Error('Unhandled action type');
    }
  }
}

function ${FeatureName}Provider({ children }: ${FeatureName}ProviderProps) {
  const [state, dispatch] = React.useReducer(${featureName}Reducer, initialState);
  return (
    <${FeatureName}StateContext.Provider value={state}>
      <${FeatureName}DispatchContext.Provider value={dispatch as any}>{children}</${FeatureName}DispatchContext.Provider>
    </${FeatureName}StateContext.Provider>
  );
}

function use${FeatureName}State() {
  const context = React.useContext(${FeatureName}StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a App Provider');
  }
  return context;
}

function use${FeatureName}Dispatch() {
  const context = React.useContext(${FeatureName}DispatchContext);
  if (context === undefined) {
    throw new Error('Must be used within a ${FeatureName} Provider');
  }
  return context;
}

export { ${FeatureName}Provider, use${FeatureName}Dispatch, use${FeatureName}State };

`;
};
