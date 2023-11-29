# Quick Action for creating an ISO from a folder

#### New in Version 2

* Redone in JXA
    * Previous version used bash with JXA via `osascript` for popup dialog
* You can choose the output folder for the ISO
    * Default is the parent folder of the target folder of ISO conversion
    * ISO filename still defaults to target folder's name

#### TODO

1. Handle pre-existing ISO file at destination
1. MRU destination by source path
1. Change default file name (source folder)

## JXA script for Automator

```javascript
"use strict"

const app = getApp();

function getApp(input, parameters) {
    let app = Application.currentApplication();
    app.includeStandardAdditions = true;
    return app;
}

function run(input, parameters) {
    folder2iso(input[0].toString());
}

function folder2iso(srcFolder) {
    let [srcParentFolder, srcFolderName] = 
             splitPathAndName(srcFolder);

    let destChoice = chooseISODestination(srcParentFolder);

    if (destChoice.success) {
        let destFolder = destChoice.value.toString();
        let isoName = `${srcFolderName}.iso`;
        createISO(srcFolder, destFolder, isoName);
    } else {
        showErrorDialog(destChoice.value);
    }
}

function splitPathAndName(fullPath) {
    let pivot = fullPath.lastIndexOf("/") + 1;
    return [fullPath.slice(0, pivot), fullPath.slice(pivot)];
}

class Choice {
    constructor({success, value}) {
        this.success = success;
        this.value = value;
     }
}

function chooseISODestination(defaultFolder) {
    try {

        let destPath = app.chooseFolder({
                withPrompt: "Please select an output folder for the ISO image",
                defaultLocation: Path(defaultFolder)
            });

        return new Choice({success: true, value: destPath});

    } catch (err) {
        return new Choice({success: false, value: err});
    }
}

function createISO(srcFolder, destFolder, isoName) {
    let makeISOCmd = 
        `hdiutil makehybrid -iso -joliet -o "${destFolder}/${isoName}" "${srcFolder}"`;
    let result = app.doShellScript(makeISOCmd);
	showISODoneDialog(srcFolder);
    return result;
}

function showISODoneDialog(folder) {
    let dialogText  = `ISO image created from folder:\n"${folder}"`;
    let dialogTitle = "Enjoy Your ISO";
    let iconPath    = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/CDAudioVolumeIcon.icns');

    showDialog(dialogText, dialogTitle, iconPath);
}

function showErrorDialog(err) {
    let dialogText;
    let dialogTitle;
    let iconPath;

    if (err.errorNumber == -128) {

        // err.errorMessage is undefined at this point
        dialogText  = `ISO creation cancelled.`;
        dialogTitle = "Cancelled";
        iconPath    = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarDeleteIcon.icns');

    } else {

        dialogText  = `Error Number:  ${err.errorNumber}\n\n` + 
                      `Error Message: ${err.errorMessage}`;
        dialogTitle = "Error";
        iconPath    = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns');

    }

    showDialog(dialogText, dialogTitle, iconPath);
}

function showDialog(dialogText, dialogTitle, iconPath) {
    let buttonText  = "Done";

    app.displayDialog(
        dialogText,
        {
            withTitle: dialogTitle,
            withIcon: iconPath,
            buttons: [buttonText],
            defaultButton: buttonText,
            givingUpAfter: 10
        }
    );
}
```

## Add to Automator

1. Open Automator
1. File -> New
1. Choose Quick Action
1. At top, "Workflow receives current folders in Finder.app"
1. Select "Actions" in top left
1. Select "Library"
1. Select "Utilities"
1. Drag "Run JavaScript" action to right side of window
1. Add code above into action
1. Save Quick Action as "Folder 2 ISO"

## Additional Info

### Testing the dialog script

It's javascript using Apple's JXA. 

1. Open "Script Editor"
1. Top left corner, choose "JavaScript" as the language
1. Paste in the code below
1. Click the Play icon button to run it

```javascript
var app = Application.currentApplication();
app.includeStandardAdditions = true;

var dialogTitle = "Completed";
var dialogText = "Your ISO is ready";
var buttonText = "3===D";
var iconPath = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/CDAudioVolumeIcon.icns');

app.displayDialog(
    dialogText,
    {
        withTitle: dialogTitle,
        withIcon: iconPath,
        buttons: [buttonText],
        defaultButton: buttonText,
        givingUpAfter: 10
    }
);
```

Alternatively, it can be run from a terminal with `osascript`. This example uses a heredoc instead of a script file.

```sh
osascript -l JavaScript <<-EndOfScript
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
 
    var dialogTitle = "Completed";
    var dialogText = "Your ISO is ready";
    var buttonText = "3===D";
    var iconPath = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/CDAudioVolumeIcon.icns');

    app.displayDialog(
        dialogText,
        {
            withTitle: dialogTitle,
            withIcon: iconPath,
            buttons: [buttonText],
            defaultButton: buttonText,
            givingUpAfter: 10
        }
    );
EndOfScript
```

### Language support for `osascript`

Taken from `man osalang` and `man osascript`

```text
osalang -l
ascr appl cgxervdh  AppleScript
jscr appl cgxe-v-h  JavaScript
scpt appl cgxervdh  Generic Scripting System
       
c     compiling scripts.
g     getting source data.
x     coercing script values.
e     manipulating the event create and send functions.
r     recording scripts.
v     "convenience" APIs to execute scripts in one step.
d     manipulating dialects.
h     using scripts to handle Apple Events.
```

### Quick Action Popup Test

```sh
fullPath="$(< /dev/stdin)"

osascript -l JavaScript <<-EndOfScript
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
 
    app.displayDialog(
        \`Folder:\n"${fullPath}"\`,
        {
            withTitle: "Folder Popup Test",
            withIcon: Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ErasingIcon.icns');,
            buttons: ["Ok"],
            defaultButton: "Ok",
            givingUpAfter: 10
        }
    );
EndOfScript
```

### JXA Quick Action input parameters exploration

Drop this in a Quick Action "Run JavaScript" step to see what gets passed in.

```sh
function run(input, parameters) {

    var app = Application.currentApplication();
    app.includeStandardAdditions = true;

    var inputPath = input[0];
 
    var dialogText  = `inputPath\n${getObjectInfo(inputPath)}\n\n` +
                      `parameters:\n${getObjectInfo(parameters)}`;
    var dialogTitle = "Quick Action Run Javascript Test";
    var buttonText  = "Done";

    app.displayDialog(
        dialogText,
        {
            withTitle: dialogTitle,
            buttons: [buttonText],
            defaultButton: buttonText
        }
    );

    return input;
}

function getObjectInfo(obj) {
    return `value: ${obj}\n` +
           `type: ${Object.prototype.toString.call(obj)}\n` +
           `name: ${obj.constructor.name}\n\n` +
           `length: ${Object.keys(obj).length}\n` +
           `keys:\n${Object.keys(obj).join("\n")}`;
}
```

## Resources

#### `hdiutil`
* [How to Create an ISO with hdiutil](https://osxdaily.com/2012/03/16/create-iso-images-from-the-command-line/)

#### API Docs
* Standard Additions SDEF in Script Editor
    * Open ScriptEditor
    * File -> Open Dictionary...
    * Choose "StandardAdditions.osax"

#### JXA

* [Mac Automation Scripting Guide: Displaying Dialogs and Alerts](https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/DisplayDialogsandAlerts.html)
* [Commands Reference](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/reference/ASLR_cmds.html#//apple_ref/doc/uid/TP40000983-CH216-SW12)
* [JXA Resources](https://apple-dev.groups.io/g/jxa/wiki/3202)
* [OS X 10.10 Release Notes](https://developer.apple.com/library/archive/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/Articles/OSX10-10.html#//apple_ref/doc/uid/TP40014508-CH109-SW1)
* [OS X 10.11 Release Notes](https://developer.apple.com/library/archive/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/Articles/OSX10-11.html#//apple_ref/doc/uid/TP40014508-CH110-SW1)
* [JXA-Cookbook](https://github.com/JXA-Cookbook/JXA-Cookbook)

#### Icons

* [How to Extract App Icons and macOS Icons on a Mac](https://www.makeuseof.com/how-to-extract-app-icons-mac/)
* [Where Mac System Icons & Default Icons Are Located in Mac OS X](https://osxdaily.com/2014/07/27/mac-os-x-system-icons-location/)
* [use bundle icons in jxa dialog at DuckDuckGo](https://duckduckgo.com/?q=use+bundle+icons+in+jxa+dialog&t=brave&ia=web)
* [javascript - JXA: display dialog with custom icon - Stack Overflow](https://stackoverflow.com/questions/43966613/jxa-display-dialog-with-custom-icon)
