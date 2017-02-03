# GnomeExtendedGestures

Provides extended touchpad gesture functionality and configuration to the GNOME desktop.

## Background

By defualt, GNOME uses `libinput` to detect touchpad gestures as they are performed by the user. However, it is still fresh and the only gesture detected and acted on out of the box is four finger vertical swipes. When it sees this gesture, it switches workspaces for the user, much like macOS is famous for doing by default. I recently found [libinput-gestures](https://github.com/bulletmark/libinput-gestures) which allows you configure other gestures seen by `libinput`. There are some quirks though and I thought I could make something that works more integrated with GNOME. So I made this extension which lets you enable and configure other gestures such as three finger swipes. 

## What Does It Allow Me To Do

For now, it allows the user the configure three finger horizontal and vertical gestures to perform a choice of actions supplied through the extension settings in `gnome-tweak-tool`. It should work on most modern laptops with multitouch trackpads. It has been tested on a `Macbook Pro Retina 11,1` and a `Surface Pro 3`.

## Current Limitations

Currently there are a few limitations so far that you should be aware of: 

* Actions are currently limited to things baked into the GNOME shell because this extension is basically sandboxed there. So currenlty setting an action like "swipe to go forward or back in the browser" is not currently possible. 
* Pinch gestures are not handled or configured. Eventually I want to add in support for all pinching gestures but I have not done so yet. See issue #3.
* Four finger swipe gestures are captured by defualt by GNOME shell so they can not be handled by this extension. However, eventually four finger pinches should be able to be handled I beleive. 
* It only works with GNOME Wayland 3.22, no greater no less. There will be breakage when 3.24 is released because some of the `event` mehtod names have been changed. It will be updated for 3.24, I use Arch Linux.
* It has only been tested on Arch Linux, but it should work with Fedora 25 or any other distro that used GNOME Wayland 3.22 and `libinput`
* It *only* handles touchpad gestures, not touchscreen gestures because those are much better supported in GNOME out of the box.

## Requirements

* GNOME 3.22
* Wayland
* libinput

## License

[GPL V3](LICENSE)
