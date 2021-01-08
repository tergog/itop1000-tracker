const robot = require('robotjs');
const Jimp = require('jimp');

module.exports = {
  takeScreenshots
}

async function takeScreenshots() {
  const screenWidth = robot.getScreenSize().width;
  const screenHeight = robot.getScreenSize().height;

  const img = robot.screen.capture(0, 0, screenWidth, screenHeight);
  const path = './public/screenshots/' + Date.now() + '.png';

  // Create a new blank image, same size as Robotjs' one
  let jimp = new Jimp(screenWidth, screenHeight);

  for (let x = 0; x < screenWidth; x++) {
    for (let y = 0; y < screenHeight; y++) {
      let index = (y * img.byteWidth) + (x * img.bytesPerPixel);
      let r = img.image[index];
      let g = img.image[index + 1];
      let b = img.image[index + 2];
      let num = (r * 256) + (g * 256 * 256) + (b * 256 * 256 * 256) + 255;
      jimp.setPixelColor(num, x, y);
    }
  }

  // save image
  await jimp.write(path);

  // return image's name
  const pathArr = path.split('/');
  return pathArr[pathArr.length - 1];
}
