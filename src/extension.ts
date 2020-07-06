import {
  commands,
  ExtensionContext,
  InputBoxOptions,
  OpenDialogOptions,
  QuickPickOptions,
  Uri,
  window,
  workspace,
} from "vscode";

import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";
import * as path from "path";

import { existsSync, lstatSync, writeFile, appendFile } from "fs";
import { downloadDirToExecutablePath } from "vscode-test/out/util";

export const showMessage = (message: string) => {
  window.showInformationMessage(message);
};

export const showError = (message: string) => {
  window.showErrorMessage(message);
};

export function activate(context: ExtensionContext) {
  // TODO:
  // analyze dependencies

  let disposable = commands.registerCommand(
    "react-feature.createFeature",
    async (uri: Uri) => {
      let featureName = await promptForFeatureName();
      showMessage(`selected name is: ${featureName}`);

      let targeDirectory = "";
      try {
        targeDirectory = await getTargetDirectory(uri);
        showMessage(`log: target Directory : ${targeDirectory}`);
      } catch (error) {
        showError(`error occurred on getting targetDirectory ${error}`);
      }

      // choose file type js/jsx or ts/tsx
      //   const fileType = await promptFileType();

      const isTS = true;

      try {
        await generateFeatureArchitecture(
          `${featureName}`,
          targeDirectory,
          isTS
        );

        showMessage(`Successfully Generated ${featureName} Feature`);
      } catch (error) {
        window.showErrorMessage(
          `Error:
			${error instanceof Error ? error.message : JSON.stringify(error)}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * @description Prompt for Featured Name
 */
export function promptForFeatureName(): Thenable<string | undefined> {
  const reactFeatureNamePromptOptions: InputBoxOptions = {
    prompt: "React Feature Name",
    placeHolder: "login",
  };

  return window.showInputBox(reactFeatureNamePromptOptions);
}

/**
 *
 * @param uri
 */
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

/**
 *
 */
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

export async function generateFeatureArchitecture(
  featureName: string,
  targetDirectory: string,
  isTS: boolean
) {
  //create the feature directory if its does not exist yet

  //   const featuresDirectoryPath = getFeaturesDirectoryPath(targetDirectory);

  if (!existsSync(targetDirectory)) {
    showMessage(`target directory ${targetDirectory} not found and creating`);
    await createDirectory(targetDirectory);
  }

  // Create the feature directory
  const featureDirectoryPath = path.join(targetDirectory, featureName);
  showMessage(`log: featureDirectoryPath : ${featureDirectoryPath}`);
  console.log({ featureDirectoryPath });

  await createDirectory(featureDirectoryPath);

  // generate code for feature
  await generateBoilerPlateCodeWithFile(
    featureName,
    featureDirectoryPath,
    isTS
  );
}

export function getFeaturesDirectoryPath(currentDirectory: string): string {
  // Split the path
  const splitPath = currentDirectory.split(path.sep);
  console.log({ splitPath });

  // Remove trailing \
  if (splitPath[splitPath.length - 1] === "") {
    splitPath.pop();
  }

  // Rebuild path
  const result = splitPath.join(path.sep);
  console.log({ result });

  // Determines whether we're already in the features directory or not
  const isDirectoryAlreadyFeatures =
    splitPath[splitPath.length - 1] === `${currentDirectory}`;

  console.log(isDirectoryAlreadyFeatures);

  // If already return the current directory if not, return the current directory with the /features append to it
  //   return isDirectoryAlreadyFeatures
  //     ? result
  //     : path.join(result, currentDirectory);

  return currentDirectory;
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      mkdirp(targetDirectory);
      showMessage(`created directory ${targetDirectory}`);
      resolve();
    } catch (error) {
      showError(`error: creating Directory`);
      return reject(error);
    }
  });
}

async function generateBoilerPlateCodeWithFile(
  featureName: string,
  targetDirectory: string,
  isTS: boolean
) {
  showMessage(`creating file: ${featureName}`);
  await createFile(featureName, targetDirectory, isTS);
}

function createFile(
  featureName: string,
  targetDirectory: string,
  isTS: boolean
) {
  //   const paramCaseFeatureName = changeCase.paramCase(featureName.toLowerCase());
  const extension = isTS ? ".tsx" : ".js";
  const targetPath = `${targetDirectory}/${featureName}${extension}`;
  const fileName = `${featureName}${extension}`;

  showMessage(`log :: target path ${targetPath}`);

  if (existsSync(targetPath)) {
    showError(`file already exist ${featureName}`);
    return;
  }

  return new Promise(async (resolve, reject) => {
    writeFile(targetPath, getFileTemplate(featureName, isTS), (error) => {
      if (error) {
        showError(
          `error on creating file ${featureName} error ${JSON.stringify(error)}`
        );
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function getFileTemplate(featureName: string, isTS: boolean): string {
  if (isTS) {
    return `
		import React from 'react';
		// iam typescript ${featureName}
		`;
  }
  return `
		import React from 'react';
		// iam JAVASCRIPT ${featureName}
		`;
}

export function deactivate() {}