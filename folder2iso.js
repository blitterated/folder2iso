"use strict"

function run(input, parameters) {
    let app = Application.currentApplication();
    app.includeStandardAdditions = true;
    
    let dialog = new Dialoginator(app);
    
    let iw = new ISOWriter(app, dialog, input[0].toString());
    iw.folder2ISO();
}

class ISOWriter {

    constructor(app, dialog, srcFolder) {
        this.app = app;
        this.dialog = dialog;
        this.srcFolder = srcFolder;
        [this.srcParentFolder, this.srcFolderName] = 
                 this.splitPathAndName(this.srcFolder);
     }

    folder2ISO() {

        let destChoice = this.chooseISODestination();

        if (destChoice.success) {
            this.destFolder = destChoice.value.toString();
            this.isoName = `${this.srcFolderName}.iso`;
            this.createISO();
        } else {
            this.dialog.showError(destChoice.value);
        }
    }

    splitPathAndName(fullPath) {
        let pivot = fullPath.lastIndexOf("/") + 1;
        return [fullPath.slice(0, pivot), fullPath.slice(pivot)];
    }

    chooseISODestination() {
        try {

            let destPath = this.app.chooseFolder({
                    withPrompt: "Please select an output folder for the ISO image",
                    defaultLocation: Path(this.srcParentFolder)
                });

            return new Choice({success: true, value: destPath});

        } catch (err) {
            return new Choice({success: false, value: err});
        }
    }

    createISO() {
        let makeISOCmd = 
            `hdiutil makehybrid -iso -joliet -o "${this.destFolder}/${this.isoName}" "${this.srcFolder}"`;
        let result = this.app.doShellScript(makeISOCmd);
        this.dialog.showISODone(this.srcFolder);
        return result;
    }
}

class Dialoginator {
    constructor(app) {
        this.app = app;
     }

    showISODone(folder) {
        let dialogText  = `ISO image created from folder:\n"${folder}"`;
        let dialogTitle = "Enjoy Your ISO";

        this.show(dialogText, dialogTitle, IconPath.cdrom);
    }

    showError(err) {
        let dialogText;
        let dialogTitle;
        let iconPath;

        if (err.errorNumber == -128) {

            // err.errorMessage is undefined at this point
            dialogText  = `ISO creation cancelled.`;
            dialogTitle = "Cancelled";
            iconPath    = IconPath.noSymbol;

        } else {

            dialogText  = `Error Number:  ${err.errorNumber}\n\n` + 
                          `Error Message: ${err.errorMessage}`;
            dialogTitle = "Error";
            iconPath    = IconPath.stopSign;

        }

        this.show(dialogText, dialogTitle, iconPath);
    }

    show(dialogText, dialogTitle, iconPath) {
        let buttonText  = "Done";

        this.app.displayDialog(
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
}

class Choice {
    constructor({success, value}) {
        this.success = success;
        this.value = value;
     }
}

class IconPath {
    static cdrom    = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/CDAudioVolumeIcon.icns');
    static noSymbol = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarDeleteIcon.icns');
    static stopSign = Path('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns');
}