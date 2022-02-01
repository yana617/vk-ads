const fs = require('fs').promises;

const fileWithText = 'text.txt';
const fileWithPhotos = 'photos.txt';
const fileWithGroups = 'groups.txt';

const getDirectories = async source =>
  (await fs.readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const loadAll = async () => {
  const directories = await getDirectories('animals');
  let result = [];
  directories.forEach((dir) => {
    result.push(fs.readFile(`animals/${dir}/${fileWithText}`, 'utf8'));
    result.push(fs.readFile(`animals/${dir}/${fileWithPhotos}`, 'utf8'));
  });
  result = await Promise.all(result);
  const animals = [];

  for (let i = 0; i < result.length; i++) {
    animals.push({ text: result[i], photos: result[i + 1].split('\n') });
    i++;
  }

  let groups = await fs.readFile(fileWithGroups, 'utf8');
  groups = groups.split('\n');

  return {
    animals, groups
  }
}

module.exports = loadAll;
