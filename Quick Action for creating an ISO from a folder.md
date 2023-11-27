# Quick Action for creating an ISO from a folder

## Shell script for Automator

```sh
folder2iso () {
    fullPath="$(< /dev/stdin)"

    folderName=$(basename "$fullPath")
    folderPath=$(dirname "$fullPath")

    hdiutil makehybrid -iso -joliet -o "${folderPath}/${folderName}.iso" "${fullPath}"

    showDialog "${fullPath}"
}

showDialog() {
    folder="$1"

osascript -l JavaScript <<-EndOfScript
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
 
    var dialogText  = \`ISO image created from folder:\n"${folder}"\`;
    var dialogTitle = "Enjoy Your ISO";
    var buttonText  = "Done";
    var iconPath    = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/CDAudioVolumeIcon.icns');

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
}

folder2iso
```

## Add to Automator

1. Open Automator
1. File -> New
1. Choose Quick Action
1. At top, "Workflow receives current folders in Finder.app"
1. Search and select “Run Shell Script”
1. Drag “Run Shell Script” action to right side of window
1. Shell: /bin/bash
1. Pass input: as arguments
1. Add code above into action
1. Save QuickAction as "Make ISO from folder"

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
v     “convenience” APIs to execute scripts in one step.
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
