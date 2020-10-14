const IMAGE_SOURCE = "Unsplash";

const FORCE_IMAGE_UPDATE = true;

// Store current datetime
const date = new Date();
const hour = date.getHours();

const TERMS = `${hour > 7 && hour < 18 ? "nature" : "dark"}`;

// If we're running the script normally, go to the Calendar.
// if (!config.runsInWidget) {
//   const callback = new CallbackURL("ticktick://v1/show?smartlist=next_7_days");
//   callback.open();
//   Script.complete();
// Otherwise, create the widget.
// } else {
let widget = new ListWidget();
widget.url = `x-fantastical3://x-callback-url/show?date=${date.getFullYear().toString()}-${(
  date.getMonth() + 1
).toString()}-${date.getDate().toString()}`;

// Format the date info
let df = new DateFormatter();
df.dateFormat = "EEEE";
let dayOfWeek = widget.addText(df.string(date).toUpperCase());
widget.addSpacer(0.2);
let dateNumber = widget.addText(`${(date.getMonth() + 1).toString()}月${date.getDate().toString()}日`);
dayOfWeek.font = Font.semiboldRoundedSystemFont(16);
dateNumber.font = Font.regularRoundedSystemFont(30);

dayOfWeek.textColor = Color.white();
dateNumber.textColor = Color.white();

let files = FileManager.local();
const path = files.joinPath(files.documentsDirectory(), "TodayView.jpg");
const modificationDate = files.modificationDate(path);

// Download image if it doesn't exist, wasn't created today, or update is forced
if (!modificationDate || !sameDay(modificationDate, date) || FORCE_IMAGE_UPDATE) {
  try {
    let img = await provideImage(IMAGE_SOURCE, TERMS);
    files.writeImage(path, img);
    widget.backgroundImage = img;
  } catch {
    widget.backgroundImage = files.readImage(path);
  }
} else {
  widget.backgroundImage = files.readImage(path);
}

// Add overlay to image
let gradient = new LinearGradient();
gradient.colors = [new Color("#000000", 0.5), new Color("#000000", 0)];
gradient.locations = [0, 0.5];
widget.backgroundGradient = gradient;

widget.addSpacer();

// Finalize widget settings
widget.setPadding(16, 16, 16, 16);

Script.setWidget(widget);
widget.presentSmall();
Script.complete();
// }

// Helper function to interpret sources and terms
async function provideImage(source, terms) {
  if (source == "Bing") {
    const url = "http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US";
    const req = new Request(url);
    const json = await req.loadJSON();
    const imgURL = "http://bing.com" + json.images[0].url;
    const img = await downloadImage(imgURL);
    const rect = new Rect(-78, 0, 356, 200);
    return cropImage(img, rect);
  } else if (source == "Unsplash") {
    const img = await downloadImage("https://source.unsplash.com/featured/500x500/?" + terms);
    return img;
  }
}

// Helper function to download images
async function downloadImage(url) {
  const req = new Request(url);
  return await req.loadImage();
}

// Crop an image into a rect
function cropImage(img, rect) {
  let draw = new DrawContext();
  draw.respectScreenScale = true;

  draw.drawImageInRect(img, rect);
  return draw.getImage();
}

// Determines if two dates occur on the same day
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
