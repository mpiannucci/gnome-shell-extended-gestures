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
        // The swipe options grid setup
        this._swipeOptionsFrame = new Gtk.Frame();
        this._swipeOptionsFrame.set_label("Swipe Options");
        this._swipeOptionsGrid = new Gtk.Grid();
        this._swipeOptionsFrame.add(this._swipeOptionsGrid);
        
        // The swipe options
        // Three finger horizontal
        this._horizontalThreeLabel = new Gtk.Label({label: "3 Finger Horizontal Gestures"});
        this._horizontalThreeSwitch = new Gtk.Switch();
        this._horizontalThreeCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._horizontalThreeLabel, 0, 0, 1, 1);
        this._swipeOptionsGrid.attach(this._horizontalThreeSwitch, 1, 0, 1, 1);
        this._swipeOptionsGrid.attach(this._horizontalThreeCombo, 2, 0, 1, 1);

        // Three finger vertical
        this._verticalThreeLabel = new Gtk.Label({label: "3 Finger Vertical Gestures"});
        this._verticalThreeSwitch = new Gtk.Switch();
        this._verticalThreeCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._verticalThreeLabel, 0, 1, 1, 1);
        this._swipeOptionsGrid.attach(this._verticalThreeSwitch, 1, 1, 1, 1);
        this._swipeOptionsGrid.attach(this._verticalThreeCombo, 2, 1, 1, 1);

        // Four finger horizontal
        this._horizontalFourLabel = new Gtk.Label({label: "4 Finger Horizontal Gestures"});
        this._horizontalFourSwitch = new Gtk.Switch();
        this._horizontalFourCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._horizontalFourLabel, 0, 2, 1, 1);
        this._swipeOptionsGrid.attach(this._horizontalFourSwitch, 1, 2, 1, 1);
        this._swipeOptionsGrid.attach(this._horizontalFourCombo, 2, 2, 1, 1);

        // Four finger vertical
        this._verticalFourLabel = new Gtk.Label({label: "4 Finger Vertical Gestures"});
        this._verticalFourSwitch = new Gtk.Switch();
        this._verticalFourCombo = new Gtk.ComboBoxText();
        this._swipeOptionsGrid.attach(this._verticalFourLabel, 0, 3, 1, 1);
        this._swipeOptionsGrid.attach(this._verticalFourSwitch, 1, 3, 1, 1);
        this._swipeOptionsGrid.attach(this._verticalFourCombo, 2, 3, 1, 1);

        // Add everything to the main view
        this.add(this._swipeOptionsFrame);
    },

    _initUI: function() {
        let actions = ['Toggle Overview', 'Cycle Applications', 'Show App Drawer', 'Switch Workspace'];

        // Disable four finger options for now :(
        this._horizontalFourSwitch.set_active(false);
        this._horizontalFourSwitch.set_sensitive(false);
        this._verticalFourSwitch.set_active(true);
        this._verticalFourSwitch.set_sensitive(false);

        // Bind the three swipe toggles to their setting values
        schema.bind('horizontal-three-swipes', this._horizontalThreeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        schema.bind('vertical-three-swipes', this._verticalThreeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

        // Action set up
        this._horizontalThreeCombo.connect('changed', Lang.bind(this, this._horizontalThreeComboChanged));
        this._verticalThreeCombo.connect('changed', Lang.bind(this, this._verticalThreeComboChanged));
        this._horizontalFourCombo.set_sensitive(false);
        this._verticalFourCombo.set_sensitive(false);
        for (let i = 0; i < actions.length; i++) {
            this._horizontalThreeCombo.append_text(actions[i]);
            this._verticalThreeCombo.append_text(actions[i]);
            this._horizontalFourCombo.append_text(actions[i]);
            this._verticalFourCombo.append_text(actions[i]);
        }
        this._horizontalThreeCombo.set_active(schema.get_enum('horizontal-three-action'));
        this._verticalThreeCombo.set_active(schema.get_enum('vertical-three-action'));
        this._horizontalFourCombo.set_active(0);
        this._verticalFourCombo.set_active(3);
    },

    _horizontalThreeComboChanged: function () {
        schema.set_enum('horizontal-three-action', this._horizontalThreeCombo.get_active());
    }, 

    _verticalThreeComboChanged: function () {
        schema.set_enum('vertical-three-action', this._verticalThreeCombo.get_active());
    }
});

function buildPrefsWidget () {
    let settingsWidget = new ExtendedGesturesSettingsWidget ();
    settingsWidget.show_all ();
    return settingsWidget;
}