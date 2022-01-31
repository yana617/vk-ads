const fs = require('fs').promises;

const fileWithText = 'text.txt';
const fileWithPhotos = 'photos.txt';
const fileWithGroups = 'groups.txt';

let text = '';
let photos = [];
let groups = [];

const loadAll = async() => {
  text = await fs.readFile(fileWithText, 'utf8');

  photos = await fs.readFile(fileWithPhotos, 'utf8');
  photos = photos.split('\n');
  
  groups = await fs.readFile(fileWithGroups, 'utf8');
  groups = groups.split('\n');

  return {
    text, photos, groups
  }
}

module.exports = loadAll;
