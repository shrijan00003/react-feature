import {
  Uri,
  window,
  commands,
  InputBoxOptions,
  ExtensionContext,
  OpenDialogOptions,
} from "vscode";

import * as _ from "lodash";
import * as mkdirp from "mkdirp";
import * as changeCase from "change-case";
import { existsSync, lstatSync, writeFileSync } from "fs";

import { typeTemplate } from "./template/types";
import { styleTemplate } from "./template/style";
import { routeTemplate } from "./template/route";
import { featureTemplate } from "./template/feature";
import { contextTypescript } from "./template/context";

export const showMessage = (message: string) => {
  window.showInformationMessage(message);
};

export const showError = (message: string) => {
  window.showErrorMessage(message);
};

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand(
    "react-feature.createFeature",
    async (uri: Uri) => {
      const module = await promptForFeatureName();
      const featureName = module?.split(".")[0];
      const extension = module?.split(".")[1];

      showMessage(`selected name is: ${featureName}`);

      try {
        const targetDirectory = await getTargetDirectory(uri);
        showMessage(`target Dir :: ${targetDirectory}`);
        showMessage(`log: target Directory : ${targetDirectory}`);

        const isTS = "js" === extension ? false : true;
        const parentDirPath = `${targetDirectory}/${featureName}`;

        if (targetDirectory && featureName) {
          createFiles(parentDirPath, featureName, isTS);
        }
      } catch (error) {
        showError(`error occurred on getting targetDirectory ${error}`);
      }
    }
  );

  const createFiles = async (
    parentDirPath: string,
    featureName: string,
    isTS: boolean
  ) => {
    featureName = changeCase.paramCase(featureName);

    try {
      await mkdirp(parentDirPath);

      if (!existsSync(parentDirPath)) {
        return showError(`Parent Directory not made yet !!`);
      }

      createFeatureFile(parentDirPath, featureName, isTS);
      createContextFile(parentDirPath, featureName, isTS);
      createTypeFile(parentDirPath, featureName, isTS);
      createStyleFile(parentDirPath, featureName, isTS);
      createRouteFile(parentDirPath, featureName, isTS);
    } catch (error) {
      showError(`error on creating file ${JSON.stringify(error)}`);
    }
  };

  context.subscriptions.push(disposable);
}

export function createRouteFile(
  parentPath: string,
  featureName: string,
  isTypescript: boolean = true
) {
  const ext = isTypescript ? ".tsx" : ".js";
  const f = changeCase.paramCase(featureName);
  const path = `${parentPath}/${f}.route${ext}`;
  createFileSynchronously(path, routeTemplate(featureName));
}

export function createContextFile(
  parentPath: string,
  featureName: string,
  isTypescript: boolean = true
) {
  const ext = isTypescript ? ".tsx" : ".js";
  const f = changeCase.paramCase(featureName);
  const path = `${parentPath}/${f}.context${ext}`;
  createFileSynchronously(path, contextTypescript(featureName));
}

export function createTypeFile(
  parentPath: string,
  featureName: string,
  isTypescript: boolean = true
) {
  const ext = isTypescript ? ".ts" : ".js";
  const f = changeCase.paramCase(featureName);
  const path = `${parentPath}/${f}.type${ext}`;
  createFileSynchronously(path, typeTemplate(featureName));
}

export function createStyleFile(
  parentPath: string,
  featureName: string,
  isTypescript: boolean = true
) {
  const ext = isTypescript ? ".ts" : ".js";
  const f = changeCase.paramCase(featureName);
  const path = `${parentPath}/${f}.style${ext}`;
  createFileSynchronously(path, styleTemplate());
}

export function createFeatureFile(
  parentPath: string,
  featureName: string,
  isTypescript: boolean = true
) {
  const ext = isTypescript ? ".tsx" : ".js";
  const path = `${parentPath}/${featureName}${ext}`;
  createFileSynchronously(path, featureTemplate(featureName));
}

export function createFileSynchronously(path: string, content: string) {
  try {
    writeFileSync(path, content);
  } catch (error) {
    showError(`error on creating file ${path}:: ${JSON.stringify(error)}`);
  }
}

export function promptForFeatureName(): Thenable<string | undefined> {
  const reactFeatureNamePromptOptions: InputBoxOptions = {
    prompt: "React Feature Name",
    placeHolder: "Auth",
  };

  return window.showInputBox(reactFeatureNamePromptOptions);
}

export async function getTargetDirectory(uri: Uri): Promise<string> {
  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      throw Error("Please select a valid directory");
    }
  } else {
    targetDirectory = uri.fsPath;
  }
  return targetDirectory;
}

export async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create new react feature in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

export function deactivate() {}
