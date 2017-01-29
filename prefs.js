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

        let builder = new Gtk.Builder ();
        builder.add_from_file (Extension.path + '/prefs.glade');
        builder.connect_signals(this);

        // The main grid
        this._mainGrid = builder.get_object('mainGrid');
        this.add(this._mainGrid);

        // Switches
        this._horizontalThreeSwitch = builder.get_object('horizontalThreeSwitch');
        this._horizontalThreeSwitch.set_active(schema.get_boolean('horizontal-three-swipes'));
        this._horizontalThreeSwitch.connect('notify::active', Lang.bind(this, this._horizontalThreeSwitchChanged));
        this._verticalThreeSwitch = builder.get_object('verticalThreeSwitch');
        this._verticalThreeSwitch.set_active(schema.get_boolean('vertical-three-swipes'));
        this._verticalThreeSwitch.connect('notify::active', Lang.bind(this, this._verticalThreeSwitchChanged));
        this._horizontalFourSwitch = builder.get_object('horizontalFourSwitch');
        this._horizontalFourSwitch.set_active(schema.get_boolean('horizontal-four-swipes'));
        this._horizontalFourSwitch.connect('notify::active', Lang.bind(this, this._horizontalFourSwitchChanged));
        this._verticalFourSwitch = builder.get_object('verticalFourSwitch');
        this._verticalFourSwitch.set_active(true);
        this._verticalFourSwitch.set_sensitive(false);

        // Combos
        let actions = ['Toggle Overview', 'Cycle Applications', 'Show App Drawer', 'Switch Workspace'];
        this._horizontalThreeCombo = builder.get_object('horizontalThreeActionCombo');
        this._horizontalThreeCombo.connect('changed', Lang.bind(this, this._horizontalThreeComboChanged));
        this._verticalThreeCombo = builder.get_object('verticalThreeActionCombo');
        this._verticalThreeCombo.connect('changed', Lang.bind(this, this._verticalThreeComboChanged));
        this._horizontalFourCombo = builder.get_object('horizontalFourActionCombo');
        this._horizontalFourCombo.connect('changed', Lang.bind(this, this._horizontalFourComboChanged));
        this._verticalFourCombo = builder.get_object('verticalFourActionCombo');
        this._verticalFourCombo.set_sensitive(false);
        for (let i = 0; i < actions.length; i++) {
            this._horizontalThreeCombo.append_text(actions[i]);
            this._verticalThreeCombo.append_text(actions[i]);
            this._horizontalFourCombo.append_text(actions[i]);
            this._verticalFourCombo.append_text(actions[i]);
        }
        this._horizontalThreeCombo.set_active(schema.get_enum('horizontal-three-action'));
        this._verticalThreeCombo.set_active(schema.get_enum('vertical-three-action'));
        this._horizontalFourCombo.set_active(schema.get_enum('horizontal-four-action'));
        this._verticalFourCombo.set_active(4);
    },

    _horizontalThreeSwitchChanged: function () {
        schema.set_boolean('horizontal-three-swipes', this._horizontalThreeSwitch.get_active());
    },

    _verticalThreeSwitchChanged: function () {
        schema.set_boolean('vertical-three-swipes', this._verticalThreeSwitch.get_active());
    },

    _horizontalFourSwitchChanged: function () {
        schema.set_boolean('horizontal-four-swipes', this._horizontalFourSwitch.get_active());
    },

    _horizontalThreeComboChanged: function () {
        schema.set_enum('horizontal-three-action', this._horizontalThreeCombo.get_active());
    }, 

    _verticalThreeComboChanged: function () {
        schema.set_enum('vertical-three-action', this._verticalThreeCombo.get_active());
    },

    _horizontalFourComboChanged: function () {
        schema.set_enum('horizontal-four-action', this._horizontalFourCombo.get_active());
    }
});

function buildPrefsWidget () {
    let settingsWidget = new ExtendedGesturesSettingsWidget ();
    settingsWidget.show_all ();
    return settingsWidget;
}