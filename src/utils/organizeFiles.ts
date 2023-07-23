import * as fs from 'fs';
import * as path from 'path';

function organizeFiles(folderPath: string) {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    const parentFolder = path.dirname(filePath).split('\\')[1];
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      organizeFiles(filePath); // Recursive call to process subdirectories
      return;
    }

    const rootName = file
      .split('.', 2)
      .filter((part) => part !== 'ts' && part !== 'spec');

    const singularParentFolder = parentFolder?.slice(0, -1);

    if (
      rootName.length === 2 &&
      (rootName[1] === parentFolder || rootName[1] === singularParentFolder)
    ) {
      const newFolderPath = path.join(folderPath, rootName[0]);
      const newFilePath = path.join(newFolderPath, file);
      fs.mkdirSync(newFolderPath, { recursive: true });
      fs.renameSync(filePath, newFilePath);
      return;
    }
  });
}

const rootFolderPath = process.argv[2] || path.join(__dirname, 'src');
organizeFiles(rootFolderPath);
