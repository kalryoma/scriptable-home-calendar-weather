const FORCE_IMAGE_UPDATE = true;

const date = new Date();
const hour = date.getHours();
const isDark = hour <= 7 || hour >= 18;
const TERMS = `${isDark ? "dark" : "nature"}`;

let widget = new ListWidget();
widget.url = `x-fantastical3://x-callback-url/show?date=${date.getFullYear().toString()}-${(
  date.getMonth() + 1
).toString()}-${date.getDate().toString()}`;

const firstLine = widget.addStack();
const day = firstLine.addStack();
const battery = firstLine.addStack();
battery.addSpacer();
const batteryLevel = Device.batteryLevel() * 100;
const batteryTxt = battery.addText(`🔋${Math.round(batteryLevel)}%`);
batteryTxt.font = Font.semiboldRoundedSystemFont(16);
batteryTxt.textColor =
  batteryLevel >= 50 ? new Color("#34c579") : batteryLevel > 20 ? new Color("#ffcc00") : new Color("#ff3b30");
widget.addSpacer(0.5);

let df = new DateFormatter();
df.dateFormat = "EEEE";
let dayOfWeek = day.addText(df.string(date).toUpperCase());
const secondLine = widget.addStack();
secondLine.setPadding(8, 0, 0, 0);
let dateNumber = secondLine.addText(`${(date.getMonth() + 1).toString()}月${date.getDate().toString()}日`);
dayOfWeek.font = Font.semiboldRoundedSystemFont(16);
dateNumber.font = Font.regularRoundedSystemFont(30);

dayOfWeek.textColor = Color.white();
dateNumber.textColor = Color.white();

const thirdLine = widget.addStack();
thirdLine.layoutVertically();
thirdLine.setPadding(8, 0, 0, 0);
CalendarEvent.today().then((events) => {
  events.forEach((event) => {
    if (event.calendar.title !== "Calendar") return;
    const eventStack = thirdLine.addStack();
    const indicator = eventStack.addText("|");
    indicator.font = Font.semiboldRoundedSystemFont(14);
    indicator.textColor = event.calendar.color;
    const title = eventStack.addText(event.title);
    title.font = Font.regularRoundedSystemFont(14);
    title.textColor = Color.white();
  });
});

let files = FileManager.local();
const path = files.joinPath(files.documentsDirectory(), "TodayView.jpg");
const modificationDate = files.modificationDate(path);

// Download image if it doesn't exist, wasn't created today, or update is forced
if (!modificationDate || !sameDay(modificationDate, date) || FORCE_IMAGE_UPDATE) {
  try {
    let img = await downloadImage("https://source.unsplash.com/featured/500x500/?" + TERMS);
    files.writeImage(path, img);
    widget.backgroundImage = img;
  } catch {
    widget.backgroundImage = files.readImage(path);
  }
} else {
  widget.backgroundImage = files.readImage(path);
}

let gradient = new LinearGradient();
gradient.colors = [new Color("#000000", 0.5), new Color("#000000", 0)];
gradient.locations = [0, 0.5];
widget.backgroundGradient = gradient;
widget.addSpacer();
widget.setPadding(16, 16, 16, 16);

Script.setWidget(widget);
widget.presentSmall();
Script.complete();

async function downloadImage(url) {
  const req = new Request(url);
  return await req.loadImage();
}

// Determines if two dates occur on the same day
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
