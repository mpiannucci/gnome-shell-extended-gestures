const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('extendedgestures');
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

let schema = null;

function init() {
    schema = Convenience.getSettings();
}

const ExtendedGesturesSettingsWidget = new GObject.Class({
    Name: 'ExtendedGestures.prefs.ExtendedGesturesSettingsWidget',
    GTypeName: 'ExtendedGesturesSettingsWidget',
    Extends: Gtk.VBox,

    _init: function (params) {
        this.parent (params);

        this._buildUI();
        this._initUI();
    },

    _buildUI: function() {
        const frameStyle = {
            valign: Gtk.Align.CENTER,
            margin: 10
        };
        const gridStyle = {
            margin: 30,
            column_homogeneous: false,
            column_spacing: 20,
            row_homogeneous: false,
            row_spacing: 5
        };
        const switchStyle = {
            valign: Gtk.Align.CENTER
        };

        // The swipe options grid setup
        this._swipeOptionsFrame = new Gtk.Frame(frameStyle);
        this._swipeOptionsGrid = new Gtk.Grid(gridStyle);
        this._swipeOptionsFrame.add(this._swipeOptionsGrid);

        // The swipe options
        // Three finger horizontal
        this._leftThreeLabel = new Gtk.Label({label: "3 Finger Left Horizontal Gestures"});
        this._leftThreeSwitch = new Gtk.Switch(switchStyle);
        this._leftThreeCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._leftThreeLabel, 0, 0, 1, 1);
        this._swipeOptionsGrid.attach(this._leftThreeSwitch, 1, 0, 1, 1);
        this._swipeOptionsGrid.attach(this._leftThreeCombo, 2, 0, 1, 1);
        this._rightThreeLabel = new Gtk.Label({label: "3 Finger Right Horizontal Gestures"});
        this._rightThreeSwitch = new Gtk.Switch(switchStyle);
        this._rightThreeCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._rightThreeLabel, 0, 1, 1, 1);
        this._swipeOptionsGrid.attach(this._rightThreeSwitch, 1, 1, 1, 1);
        this._swipeOptionsGrid.attach(this._rightThreeCombo, 2, 1, 1, 1);

        // Three finger vertical
        this._upThreeLabel = new Gtk.Label({label: "3 Finger Up Vertical Gestures"});
        this._upThreeSwitch = new Gtk.Switch(switchStyle);
        this._upThreeCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._upThreeLabel, 0, 2, 1, 1);
        this._swipeOptionsGrid.attach(this._upThreeSwitch, 1, 2, 1, 1);
        this._swipeOptionsGrid.attach(this._upThreeCombo, 2, 2, 1, 1);
        this._downThreeLabel = new Gtk.Label({label: "3 Finger Down Vertical Gestures"});
        this._downThreeSwitch = new Gtk.Switch(switchStyle);
        this._downThreeCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._downThreeLabel, 0, 3, 1, 1);
        this._swipeOptionsGrid.attach(this._downThreeSwitch, 1, 3, 1, 1);
        this._swipeOptionsGrid.attach(this._downThreeCombo, 2, 3, 1, 1);

        // Four finger horizontal
        this._horizontalFourLabel = new Gtk.Label({label: "4 Finger Horizontal Gestures"});
        this._horizontalFourSwitch = new Gtk.Switch(switchStyle);
        this._horizontalFourCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._horizontalFourLabel, 0, 4, 1, 1);
        this._swipeOptionsGrid.attach(this._horizontalFourSwitch, 1, 4, 1, 1);
        this._swipeOptionsGrid.attach(this._horizontalFourCombo, 2, 4, 1, 1);

        // Four finger vertical
        this._verticalFourLabel = new Gtk.Label({label: "4 Finger Vertical Gestures"});
        this._verticalFourSwitch = new Gtk.Switch(switchStyle);
        this._verticalFourCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._verticalFourLabel, 0, 5, 1, 1);
        this._swipeOptionsGrid.attach(this._verticalFourSwitch, 1, 5, 1, 1);
        this._swipeOptionsGrid.attach(this._verticalFourCombo, 2, 5, 1, 1);

        // The sensitivity options
        this._sensitivityOptionsFrame = new Gtk.Frame(frameStyle);
        this._sensitivityOptionsGrid = new Gtk.Grid(gridStyle);
        this._sensitivityOptionsFrame.add(this._sensitivityOptionsGrid);

        // Vertical sensitivity
        this._verticalSensitivityLabel = new Gtk.Label({label: "Vertical Sensitivity Adjustment"});
        this._verticalSensitivitySpinButton = Gtk.SpinButton.new_with_range(-50, 50, 1);
        this._sensitivityOptionsGrid.attach(this._verticalSensitivityLabel, 0, 0, 1, 1);
        this._sensitivityOptionsGrid.attach(this._verticalSensitivitySpinButton, 1, 0, 1, 1);

        // Horizontal sensitivity
        this._horizontalSensitivityLabel = new Gtk.Label({label: "Horizontal Sensitivity Adjustment"});
        this._horizontalSensitivitySpinButton = Gtk.SpinButton.new_with_range(-50, 50, 1);
        this._sensitivityOptionsGrid.attach(this._horizontalSensitivityLabel, 0, 1, 1, 1);
        this._sensitivityOptionsGrid.attach(this._horizontalSensitivitySpinButton, 1, 1, 1, 1);

        // Add everything to the main view
        this.add(this._swipeOptionsFrame);
        this.add(this._sensitivityOptionsFrame);
    },

    _initUI: function() {
        const actions = [
        'Toggle Overview',
        'Cycle Applications',
        'Show App Drawer',
        'Switch Workspace',
        'Show desktop',
        'Nothing',
        'Next Workspace',
        'Previous Workspace',
        'Go Forward',
        'Go Back',
        'Show App Drawer (unanimated)'
        ];

        // Disable four finger options for now :(
        this._horizontalFourSwitch.set_active(false);
        this._horizontalFourSwitch.set_sensitive(false);
        this._verticalFourSwitch.set_active(true);
        this._verticalFourSwitch.set_sensitive(false);

        // Bind the three swipe toggles to their setting values
        schema.bind('left-three-swipes', this._leftThreeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        schema.bind('right-three-swipes', this._rightThreeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        schema.bind('up-three-swipes', this._upThreeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        schema.bind('down-three-swipes', this._downThreeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

        // Action set up
        this._leftThreeCombo.connect('changed', Lang.bind(this, this._leftThreeComboChanged));
        this._rightThreeCombo.connect('changed', Lang.bind(this, this._rightThreeComboChanged));
        this._upThreeCombo.connect('changed', Lang.bind(this, this._upThreeComboChanged));
        this._downThreeCombo.connect('changed', Lang.bind(this, this._downThreeComboChanged));
        this._horizontalFourCombo.set_sensitive(false);
        this._verticalFourCombo.set_sensitive(false);
        for (let i = 0; i < actions.length; i++) {
            this._leftThreeCombo.append_text(actions[i]);
            this._rightThreeCombo.append_text(actions[i]);
            this._upThreeCombo.append_text(actions[i]);
            this._downThreeCombo.append_text(actions[i]);
            this._horizontalFourCombo.append_text(actions[i]);
            this._verticalFourCombo.append_text(actions[i]);
        }
        this._leftThreeCombo.set_active(schema.get_enum('left-three-action'));
        this._rightThreeCombo.set_active(schema.get_enum('right-three-action'));
        this._upThreeCombo.set_active(schema.get_enum('up-three-action'));
        this._downThreeCombo.set_active(schema.get_enum('down-three-action'));
        this._horizontalFourCombo.set_active(0);
        this._verticalFourCombo.set_active(3);

        // Sensitivity options setup
        schema.bind('vertical-sensitivity-adjustment', this._verticalSensitivitySpinButton, 'value', Gio.SettingsBindFlags.DEFAULT);
        schema.bind('horizontal-sensitivity-adjustment', this._horizontalSensitivitySpinButton, 'value', Gio.SettingsBindFlags.DEFAULT);
    },

    _leftThreeComboChanged: function () {
        schema.set_enum('left-three-action', this._leftThreeCombo.get_active());
    },

    _rightThreeComboChanged: function () {
        schema.set_enum('right-three-action', this._rightThreeCombo.get_active());
    },

    _upThreeComboChanged: function () {
        schema.set_enum('up-three-action', this._upThreeCombo.get_active());
    },

    _downThreeComboChanged: function () {
        schema.set_enum('down-three-action', this._downThreeCombo.get_active());
    },
});

function buildPrefsWidget () {
    let settingsWidget = new ExtendedGesturesSettingsWidget ();
    settingsWidget.show_all ();
    return settingsWidget;
}
