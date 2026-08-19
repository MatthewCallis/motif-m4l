{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 9,
      "minor": 0,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      60,
      60,
      2800,
      1800
    ],
    "bglocked": 0,
    "openinpresentation": 1,
    "default_fontsize": 10,
    "default_fontface": 0,
    "default_fontname": "Ableton Sans",
    "gridonopen": 1,
    "gridsize": [
      8,
      8
    ],
    "gridsnaponopen": 1,
    "objectsnaponopen": 1,
    "statusbarvisible": 2,
    "toolbarvisible": 1,
    "devicewidth": 475,
    "description": "Scale-aware triggerable motif engine with native Live Song synchronization and visual note preview",
    "digest": "Motif/Settings tabs; native Song observers; fail-open MIDI; BPM multiplier; Library authoring popup",
    "tags": "midi motif phrase scale",
    "boxes": [
      {
        "box": {
          "fontname": "Ableton Sans",
          "fontsize": 9,
          "mode": 0,
          "livemode": 1,
          "multiline": 0,
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            0,
            4,
            96,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "Motif",
                "Settings"
              ],
              "parameter_longname": "Page",
              "parameter_mmax": 1,
              "parameter_shortname": "Page",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "page-tab",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "hidden": 0,
          "annotation_name": "Page",
          "annotation": "Switch between the Motif performance view and Settings for less-used controls.",
          "hint": "Switch between the Motif performance view and Settings for less-used controls.",
          "id": "obj-1",
          "maxclass": "live.tab",
          "patching_rect": [
            0,
            4,
            96,
            20
          ]
        }
      },
      {
        "box": {
          "items": [
            "Loading..."
          ],
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "bgcolor": [
            0.08,
            0.08,
            0.09,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "bordercolor": [
            0.2,
            0.2,
            0.22,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "ignoreclick": 0,
          "presentation": 1,
          "presentation_rect": [
            100,
            4,
            210,
            20
          ],
          "varname": "motif-menu",
          "hidden": 0,
          "annotation_name": "Selected Motif",
          "annotation": "Choose the phrase played when a trigger note is received. The preview updates immediately.",
          "hint": "Choose the phrase played when a trigger note is received. The preview updates immediately.",
          "id": "obj-2",
          "maxclass": "umenu",
          "patching_rect": [
            100,
            4,
            210,
            20
          ]
        }
      },
      {
        "box": {
          "text": "BPM ×",
          "presentation": 1,
          "presentation_rect": [
            318,
            5,
            35,
            20
          ],
          "varname": "tempo-mult-label",
          "hidden": 0,
          "id": "obj-3",
          "maxclass": "live.comment",
          "patching_rect": [
            318,
            5,
            35,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            356,
            6.5,
            32,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "0.5",
                "1",
                "1.5",
                "2"
              ],
              "parameter_longname": "BPM Multiplier",
              "parameter_mmax": 3,
              "parameter_shortname": "BPM ×",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                1
              ]
            }
          },
          "varname": "tempo-mult-menu",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 0,
          "annotation_name": "BPM Multiplier",
          "annotation": "Multiplies Live's Song tempo for motif scheduling only. Does not change the Live Set tempo. Default is 1.",
          "hint": "Multiplies Live's Song tempo for motif scheduling only. Does not change the Live Set tempo. Default is 1.",
          "id": "obj-4",
          "maxclass": "live.menu",
          "patching_rect": [
            356,
            6.5,
            32,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 0,
          "outputmode": 0,
          "parameter_enable": 0,
          "text": "Info",
          "texton": "Info",
          "presentation": 1,
          "presentation_rect": [
            399,
            4,
            32,
            20
          ],
          "varname": "info-button",
          "hidden": 0,
          "annotation_name": "Library & Authoring",
          "annotation": "Open the floating library browser: search motifs, import a Live clip, edit notes, and save JSON.",
          "hint": "Open the floating library browser: search motifs, import a Live clip, edit notes, and save JSON.",
          "id": "obj-5",
          "maxclass": "live.text",
          "patching_rect": [
            399,
            4,
            32,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 0,
          "outputmode": 0,
          "parameter_enable": 0,
          "text": "Panic",
          "texton": "Panic",
          "presentation": 1,
          "presentation_rect": [
            435,
            4,
            40,
            20
          ],
          "varname": "panic-button",
          "hidden": 0,
          "annotation_name": "Panic",
          "annotation": "Immediately clears scheduled phrase events, releases tracked notes, and resets sustain and all notes on every MIDI channel.",
          "hint": "Immediately clears scheduled phrase events, releases tracked notes, and resets sustain and all notes on every MIDI channel.",
          "id": "obj-6",
          "maxclass": "live.text",
          "patching_rect": [
            435,
            4,
            40,
            20
          ]
        }
      },
      {
        "box": {
          "filename": "motif-preview-80e1cedd19c3.js",
          "template": "motif-preview-80e1cedd19c3.js",
          "border": 0,
          "jsarguments": [
            6,
            1
          ],
          "ignoreclick": 0,
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            2,
            28,
            471,
            120
          ],
          "varname": "motif-preview",
          "hidden": 0,
          "annotation_name": "Motif Note Preview",
          "annotation": "A time-and-pitch preview of the selected motif after applying the effective scale, pitch mode, meter mode, BPM multiplier, and most recent trigger note.",
          "hint": "A time-and-pitch preview of the selected motif after applying the effective scale, pitch mode, meter mode, BPM multiplier, and most recent trigger note.",
          "id": "obj-7",
          "maxclass": "jsui",
          "patching_rect": [
            2,
            28,
            471,
            120
          ]
        }
      },
      {
        "box": {
          "text": "Pitch",
          "presentation": 1,
          "presentation_rect": [
            0,
            150,
            40,
            18
          ],
          "varname": "pitch-label",
          "hidden": 0,
          "id": "obj-8",
          "maxclass": "live.comment",
          "patching_rect": [
            0,
            150,
            40,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            32,
            151,
            64,
            18
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "motif",
                "scale",
                "chromatic",
                "hybrid"
              ],
              "parameter_longname": "Pitch Mode",
              "parameter_mmax": 3,
              "parameter_shortname": "Pitch",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "pitch-menu",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 0,
          "annotation_name": "Pitch Mode",
          "annotation": "Motif uses the phrase's stored pitch mode. Scale maps stored degrees through the effective scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.",
          "hint": "Motif uses the phrase's stored pitch mode. Scale maps stored degrees through the effective scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.",
          "id": "obj-9",
          "maxclass": "live.menu",
          "patching_rect": [
            32,
            151,
            64,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 1,
          "outputmode": 0,
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "Invert Motif Offsets",
              "parameter_mmax": 1,
              "parameter_mmin": 0,
              "parameter_shortname": "Invert",
              "parameter_type": 1,
              "parameter_unitstyle": 8
            }
          },
          "text": "Invert",
          "texton": "Invert",
          "presentation": 1,
          "presentation_rect": [
            100,
            150,
            48,
            18
          ],
          "varname": "invert-button",
          "hidden": 0,
          "annotation_name": "Invert Motif Offsets",
          "annotation": "Mirror relative pitch offsets around the trigger note without changing the stored motif.",
          "hint": "Mirror relative pitch offsets around the trigger note without changing the stored motif.",
          "id": "obj-10",
          "maxclass": "live.text",
          "patching_rect": [
            100,
            150,
            48,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 1,
          "outputmode": 0,
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "Reverse Motif Notes",
              "parameter_mmax": 1,
              "parameter_mmin": 0,
              "parameter_shortname": "Reverse",
              "parameter_type": 1,
              "parameter_unitstyle": 8
            }
          },
          "text": "Reverse",
          "texton": "Reverse",
          "presentation": 1,
          "presentation_rect": [
            152,
            150,
            52,
            18
          ],
          "varname": "reverse-button",
          "hidden": 0,
          "annotation_name": "Reverse Motif Notes",
          "annotation": "Play the motif backward by mirroring note timing without changing the stored motif.",
          "hint": "Play the motif backward by mirroring note timing without changing the stored motif.",
          "id": "obj-11",
          "maxclass": "live.text",
          "patching_rect": [
            152,
            150,
            52,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 1,
          "outputmode": 0,
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "Scale Override",
              "parameter_mmax": 1,
              "parameter_mmin": 0,
              "parameter_shortname": "Scale",
              "parameter_type": 1,
              "parameter_unitstyle": 8
            }
          },
          "text": "Scale",
          "texton": "Scale",
          "presentation": 1,
          "presentation_rect": [
            208,
            150,
            40,
            18
          ],
          "varname": "scale-button",
          "hidden": 0,
          "annotation_name": "Scale Override",
          "annotation": "Use the selected root and scale for Motif instead of Live's current scale. Turn off to follow Live again.",
          "hint": "Use the selected root and scale for Motif instead of Live's current scale. Turn off to follow Live again.",
          "id": "obj-12",
          "maxclass": "live.text",
          "patching_rect": [
            208,
            150,
            40,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            252,
            151,
            40,
            18
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "C",
                "C#",
                "D",
                "D#",
                "E",
                "F",
                "F#",
                "G",
                "G#",
                "A",
                "A#",
                "B"
              ],
              "parameter_longname": "Scale Root Display",
              "parameter_mmax": 11,
              "parameter_shortname": "Root",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ],
              "parameter_invisible": 2
            }
          },
          "varname": "root-display",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 0,
          "annotation_name": "Scale Root",
          "annotation": "Shows Live's root while Scale is off. When Scale is on, choose Motif's device-local root.",
          "hint": "Shows Live's root while Scale is off. When Scale is on, choose Motif's device-local root.",
          "id": "obj-13",
          "maxclass": "live.menu",
          "patching_rect": [
            252,
            151,
            40,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            296,
            151,
            177,
            18
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "Major",
                "Minor",
                "Dorian",
                "Mixolydian",
                "Lydian",
                "Phrygian",
                "Locrian",
                "Whole Tone",
                "Half-whole Dim.",
                "Whole-half Dim.",
                "Minor Blues",
                "Minor Pentatonic",
                "Major Pentatonic",
                "Harmonic Minor",
                "Harmonic Major",
                "Dorian #4",
                "Phrygian Dominant",
                "Melodic Minor",
                "Lydian Augmented",
                "Lydian Dominant",
                "Super Locrian",
                "8-Tone Spanish",
                "Spanish",
                "Bhairav",
                "Hungarian Minor",
                "Chinese",
                "Hirajoshi",
                "In-Sen",
                "Iwato",
                "Kumoi",
                "Pelog Selisir",
                "Pelog Tembung",
                "Pelog",
                "Messiaen 3",
                "Messiaen 4",
                "Messiaen 5",
                "Messiaen 6",
                "Messiaen 7"
              ],
              "parameter_longname": "Scale Name Display",
              "parameter_mmax": 37,
              "parameter_shortname": "Scale",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ],
              "parameter_invisible": 2
            }
          },
          "varname": "scale-name-display",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 0,
          "annotation_name": "Scale Name",
          "annotation": "Shows Live's scale while Scale is off. When Scale is on, choose Motif's device-local scale.",
          "hint": "Shows Live's scale while Scale is off. When Scale is on, choose Motif's device-local scale.",
          "id": "obj-14",
          "maxclass": "live.menu",
          "patching_rect": [
            296,
            151,
            177,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            252,
            151,
            40,
            18
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "C",
                "C#",
                "D",
                "D#",
                "E",
                "F",
                "F#",
                "G",
                "G#",
                "A",
                "A#",
                "B"
              ],
              "parameter_longname": "Scale Override Root",
              "parameter_mmax": 11,
              "parameter_shortname": "Root",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "scale-root-override",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 1,
          "annotation_name": "Scale Override Root",
          "annotation": "Stored and automatable root used while the Scale button is enabled.",
          "hint": "Stored and automatable root used while the Scale button is enabled.",
          "id": "obj-15",
          "maxclass": "live.menu",
          "patching_rect": [
            252,
            151,
            40,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            296,
            151,
            177,
            18
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "Major",
                "Minor",
                "Dorian",
                "Mixolydian",
                "Lydian",
                "Phrygian",
                "Locrian",
                "Whole Tone",
                "Half-whole Dim.",
                "Whole-half Dim.",
                "Minor Blues",
                "Minor Pentatonic",
                "Major Pentatonic",
                "Harmonic Minor",
                "Harmonic Major",
                "Dorian #4",
                "Phrygian Dominant",
                "Melodic Minor",
                "Lydian Augmented",
                "Lydian Dominant",
                "Super Locrian",
                "8-Tone Spanish",
                "Spanish",
                "Bhairav",
                "Hungarian Minor",
                "Chinese",
                "Hirajoshi",
                "In-Sen",
                "Iwato",
                "Kumoi",
                "Pelog Selisir",
                "Pelog Tembung",
                "Pelog",
                "Messiaen 3",
                "Messiaen 4",
                "Messiaen 5",
                "Messiaen 6",
                "Messiaen 7"
              ],
              "parameter_longname": "Scale Override Name",
              "parameter_mmax": 37,
              "parameter_shortname": "Scale",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "scale-name-override",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 1,
          "annotation_name": "Scale Override Name",
          "annotation": "Stored and automatable scale used while the Scale button is enabled.",
          "hint": "Stored and automatable scale used while the Scale button is enabled.",
          "id": "obj-16",
          "maxclass": "live.menu",
          "patching_rect": [
            296,
            151,
            177,
            18
          ]
        }
      },
      {
        "box": {
          "text": "Version 1.0.0",
          "presentation": 1,
          "presentation_rect": [
            104,
            5,
            82,
            18
          ],
          "varname": "version-label",
          "hidden": 1,
          "id": "obj-17",
          "maxclass": "live.comment",
          "patching_rect": [
            104,
            5,
            82,
            18
          ]
        }
      },
      {
        "box": {
          "text": "Matthew Callis",
          "presentation": 1,
          "presentation_rect": [
            190,
            5,
            128,
            18
          ],
          "varname": "author-label",
          "hidden": 1,
          "id": "obj-18",
          "maxclass": "live.comment",
          "patching_rect": [
            190,
            5,
            128,
            18
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 0,
          "outputmode": 0,
          "parameter_enable": 0,
          "text": "GitHub Repository",
          "texton": "GitHub Repository",
          "presentation": 1,
          "presentation_rect": [
            322,
            4,
            145,
            20
          ],
          "varname": "github-button",
          "hidden": 1,
          "annotation_name": "Motif GitHub Repository",
          "annotation": "Open https://github.com/MatthewCallis/motif-m4l in the default browser.",
          "hint": "Open https://github.com/MatthewCallis/motif-m4l in the default browser.",
          "id": "obj-19",
          "maxclass": "live.text",
          "patching_rect": [
            322,
            4,
            145,
            20
          ]
        }
      },
      {
        "box": {
          "text": "Trigger",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            30,
            80,
            16
          ],
          "varname": "trigger-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-20",
          "maxclass": "comment",
          "patching_rect": [
            8,
            30,
            80,
            16
          ]
        }
      },
      {
        "box": {
          "text": "Launch",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            52,
            80,
            16
          ],
          "varname": "quant-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-21",
          "maxclass": "comment",
          "patching_rect": [
            8,
            52,
            80,
            16
          ]
        }
      },
      {
        "box": {
          "text": "MIDI Pass",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            74,
            80,
            16
          ],
          "varname": "pass-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-22",
          "maxclass": "comment",
          "patching_rect": [
            8,
            74,
            80,
            16
          ]
        }
      },
      {
        "box": {
          "text": "Meter",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            96,
            80,
            16
          ],
          "varname": "meter-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-23",
          "maxclass": "comment",
          "patching_rect": [
            8,
            96,
            80,
            16
          ]
        }
      },
      {
        "box": {
          "text": "Retrigger",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            118,
            80,
            16
          ],
          "varname": "retrigger-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-24",
          "maxclass": "comment",
          "patching_rect": [
            8,
            118,
            80,
            16
          ]
        }
      },
      {
        "box": {
          "text": "Zone",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            140,
            80,
            16
          ],
          "varname": "zone-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-25",
          "maxclass": "comment",
          "patching_rect": [
            8,
            140,
            80,
            16
          ]
        }
      },
      {
        "box": {
          "text": "Repeat",
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            232,
            140,
            64,
            16
          ],
          "varname": "repeat-label",
          "ignoreclick": 1,
          "hidden": 1,
          "id": "obj-26",
          "maxclass": "comment",
          "patching_rect": [
            232,
            140,
            64,
            16
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            96,
            28,
            232,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "motif",
                "one-shot",
                "hold",
                "hold-repeat",
                "toggle",
                "latch",
                "release-tail"
              ],
              "parameter_longname": "Trigger Mode",
              "parameter_mmax": 6,
              "parameter_shortname": "Trigger",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "trigger-menu",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 1,
          "annotation_name": "Trigger Mode",
          "annotation": "Motif uses the saved lifecycle (legacy motifs use One-shot); other choices override it device-wide. Hold Repeat loops while held.",
          "hint": "Motif uses the saved lifecycle (legacy motifs use One-shot); other choices override it device-wide. Hold Repeat loops while held.",
          "id": "obj-27",
          "maxclass": "live.menu",
          "patching_rect": [
            96,
            28,
            232,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            96,
            50,
            232,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "immediate",
                "1/16",
                "1/8",
                "1/4",
                "bar"
              ],
              "parameter_longname": "Launch Quantization",
              "parameter_mmax": 4,
              "parameter_shortname": "Launch",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "quant-menu",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 1,
          "annotation_name": "Launch Quantization",
          "annotation": "Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.",
          "hint": "Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.",
          "id": "obj-28",
          "maxclass": "live.menu",
          "patching_rect": [
            96,
            50,
            232,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            96,
            72,
            232,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "none",
                "non-triggers",
                "all"
              ],
              "parameter_longname": "MIDI Pass Through",
              "parameter_mmax": 2,
              "parameter_shortname": "MIDI Pass",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                1
              ]
            }
          },
          "varname": "pass-menu",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 1,
          "annotation_name": "MIDI Pass Through",
          "annotation": "None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.",
          "hint": "None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.",
          "id": "obj-29",
          "maxclass": "live.menu",
          "patching_rect": [
            96,
            72,
            232,
            20
          ]
        }
      },
      {
        "box": {
          "fontname": "Ableton Sans",
          "fontsize": 9,
          "mode": 0,
          "livemode": 1,
          "multiline": 0,
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            96,
            94,
            232,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "preserve",
                "fit-bar"
              ],
              "parameter_longname": "Meter Mode",
              "parameter_mmax": 1,
              "parameter_shortname": "Meter",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "meter-tab",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "hidden": 1,
          "annotation_name": "Meter Mode",
          "annotation": "Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.",
          "hint": "Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.",
          "id": "obj-30",
          "maxclass": "live.tab",
          "patching_rect": [
            96,
            94,
            232,
            20
          ]
        }
      },
      {
        "box": {
          "fontname": "Ableton Sans",
          "fontsize": 9,
          "mode": 0,
          "livemode": 1,
          "multiline": 0,
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            96,
            116,
            232,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "replace",
                "overlap"
              ],
              "parameter_longname": "Retrigger Mode",
              "parameter_mmax": 1,
              "parameter_shortname": "Retrigger",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "retrigger-tab",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "hidden": 1,
          "annotation_name": "Retrigger Mode",
          "annotation": "Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.",
          "hint": "Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.",
          "id": "obj-31",
          "maxclass": "live.tab",
          "patching_rect": [
            96,
            116,
            232,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 4,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            96,
            138,
            56,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                36
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "Trigger Low",
              "parameter_mmax": 127,
              "parameter_mmin": 0,
              "parameter_shortname": "Low",
              "parameter_type": 1,
              "parameter_unitstyle": 8
            }
          },
          "varname": "low-number",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "hidden": 1,
          "annotation_name": "Trigger Zone Low",
          "annotation": "Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.",
          "hint": "Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.",
          "id": "obj-32",
          "maxclass": "live.numbox",
          "patching_rect": [
            96,
            138,
            56,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            296,
            138,
            171,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "motif",
                "exact",
                "1/4-bar",
                "1/2-bar",
                "1-bar"
              ],
              "parameter_longname": "Repeat Rounding",
              "parameter_mmax": 4,
              "parameter_shortname": "Repeat",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "repeat-menu",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 0,
          "hidden": 1,
          "annotation_name": "Repeat Rounding",
          "annotation": "Motif uses the triggered motif’s saved repeat grid. Exact and bar subdivisions override it for Hold Repeat only.",
          "hint": "Motif uses the triggered motif’s saved repeat grid. Exact and bar subdivisions override it for Hold Repeat only.",
          "id": "obj-33",
          "maxclass": "live.menu",
          "patching_rect": [
            296,
            138,
            171,
            20
          ]
        }
      },
      {
        "box": {
          "appearance": 4,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            160,
            138,
            56,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                84
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "Trigger High",
              "parameter_mmax": 127,
              "parameter_mmin": 0,
              "parameter_shortname": "High",
              "parameter_type": 1,
              "parameter_unitstyle": 8
            }
          },
          "varname": "high-number",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "hidden": 1,
          "annotation_name": "Trigger Zone High",
          "annotation": "Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.",
          "hint": "Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.",
          "id": "obj-34",
          "maxclass": "live.numbox",
          "patching_rect": [
            160,
            138,
            56,
            20
          ]
        }
      },
      {
        "box": {
          "text": "§ MIDI I/O - fail-open gate ➜ midiselect ➜ engine / midiout",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-35",
          "maxclass": "comment",
          "patching_rect": [
            80,
            240,
            420,
            20
          ]
        }
      },
      {
        "box": {
          "text": "midiin",
          "id": "obj-36",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            280,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "gate 2 1",
          "id": "obj-37",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            370,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "loadmess 1",
          "id": "obj-38",
          "maxclass": "newobj",
          "patching_rect": [
            240,
            370,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "2",
          "id": "obj-39",
          "maxclass": "message",
          "patching_rect": [
            400,
            370,
            40,
            22
          ]
        }
      },
      {
        "box": {
          "text": "midiselect @ch all @note all",
          "id": "obj-40",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            460,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "midiparse",
          "id": "obj-41",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            460,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "unpack 0 0",
          "id": "obj-42",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            550,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pack 0 0 1",
          "id": "obj-43",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            640,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend note",
          "id": "obj-44",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            730,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "route 64",
          "id": "obj-45",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            550,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pack 0 1",
          "id": "obj-46",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            640,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend sustain",
          "id": "obj-47",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            730,
            130,
            22
          ]
        }
      },
      {
        "box": {
          "text": "midiflush",
          "id": "obj-48",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            910,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "midiout",
          "id": "obj-49",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1000,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Engine - v8 motif-device-5a7f1e14fb82.js + event pipe / panic / clear",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-50",
          "maxclass": "comment",
          "patching_rect": [
            720,
            240,
            620,
            20
          ]
        }
      },
      {
        "box": {
          "text": "v8 motif-device-5a7f1e14fb82.js",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-51",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            460,
            280,
            22
          ]
        }
      },
      {
        "box": {
          "text": "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
          "id": "obj-52",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            550,
            980,
            22
          ]
        }
      },
      {
        "box": {
          "text": "unpack 0 0 0 0.",
          "id": "obj-53",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            640,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pipe 0 0 0 0.",
          "id": "obj-54",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            730,
            130,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pack 0 0",
          "id": "obj-55",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            820,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "midiformat",
          "id": "obj-56",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            910,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b",
          "id": "obj-57",
          "maxclass": "newobj",
          "patching_rect": [
            1000,
            640,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b",
          "id": "obj-58",
          "maxclass": "newobj",
          "patching_rect": [
            1000,
            730,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "clear",
          "id": "obj-59",
          "maxclass": "message",
          "patching_rect": [
            1120,
            730,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "uzi 16",
          "id": "obj-60",
          "maxclass": "newobj",
          "patching_rect": [
            1000,
            820,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b i",
          "id": "obj-61",
          "maxclass": "newobj",
          "patching_rect": [
            1080,
            820,
            50,
            22
          ]
        }
      },
      {
        "box": {
          "text": "64 0, 120 0, 123 0",
          "id": "obj-62",
          "maxclass": "message",
          "patching_rect": [
            1150,
            820,
            130,
            22
          ]
        }
      },
      {
        "box": {
          "text": "midiformat",
          "id": "obj-63",
          "maxclass": "newobj",
          "patching_rect": [
            1310,
            820,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Feedback - motif menu + jweb UI emits (lib/preview as encoded JSON)",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-64",
          "maxclass": "comment",
          "patching_rect": [
            1600,
            240,
            560,
            20
          ]
        }
      },
      {
        "box": {
          "text": "clear",
          "id": "obj-65",
          "maxclass": "message",
          "patching_rect": [
            1600,
            460,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend append",
          "id": "obj-66",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            550,
            120,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend setsymbol",
          "id": "obj-67",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            640,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "route lib preview transforms",
          "id": "obj-68",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            820,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend receiveData",
          "id": "obj-69",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            910,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "send ---lib-data",
          "id": "obj-70",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            1000,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend receiveData",
          "id": "obj-71",
          "maxclass": "newobj",
          "patching_rect": [
            1840,
            910,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "route preview_ready preview_debug",
          "id": "obj-72",
          "maxclass": "newobj",
          "patching_rect": [
            2100,
            1000,
            240,
            22
          ]
        }
      },
      {
        "box": {
          "text": "preview_ready",
          "id": "obj-73",
          "maxclass": "message",
          "patching_rect": [
            2360,
            1000,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "jsfile motif-preview-80e1cedd19c3.js, loadbang",
          "id": "obj-74",
          "maxclass": "message",
          "patching_rect": [
            2360,
            1090,
            300,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend preview",
          "id": "obj-75",
          "maxclass": "newobj",
          "patching_rect": [
            2100,
            1090,
            130,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend web_debug",
          "id": "obj-76",
          "maxclass": "newobj",
          "patching_rect": [
            2260,
            1090,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "unpack 0 0",
          "id": "obj-77",
          "maxclass": "newobj",
          "patching_rect": [
            2080,
            910,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend set",
          "id": "obj-78",
          "maxclass": "newobj",
          "patching_rect": [
            2200,
            910,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend set",
          "id": "obj-79",
          "maxclass": "newobj",
          "patching_rect": [
            2320,
            910,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Song observers - live.path live_set ➜ live.observer ➜ song_context ➜ v8",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-80",
          "maxclass": "comment",
          "patching_rect": [
            80,
            1160,
            560,
            20
          ]
        }
      },
      {
        "box": {
          "text": "live.thisdevice",
          "id": "obj-81",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1200,
            120,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b",
          "id": "obj-82",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1290,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b b b b",
          "id": "obj-83",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            1290,
            200,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.path live_set",
          "id": "obj-84",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1380,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "deferlow",
          "id": "obj-85",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1470,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "initialize",
          "id": "obj-86",
          "maxclass": "message",
          "patching_rect": [
            80,
            1560,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "deferlow",
          "id": "obj-87",
          "maxclass": "newobj",
          "patching_rect": [
            300,
            1560,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "route Ready",
          "id": "obj-88",
          "maxclass": "newobj",
          "patching_rect": [
            480,
            1560,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b",
          "id": "obj-89",
          "maxclass": "newobj",
          "patching_rect": [
            660,
            1560,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b b b b",
          "id": "obj-90",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            1560,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "presentation 1",
          "id": "obj-91",
          "maxclass": "message",
          "patching_rect": [
            480,
            1380,
            120,
            22
          ]
        }
      },
      {
        "box": {
          "text": "thispatcher",
          "id": "obj-92",
          "maxclass": "newobj",
          "patching_rect": [
            700,
            1380,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "loadmess presentation 1",
          "id": "obj-93",
          "maxclass": "newobj",
          "patching_rect": [
            480,
            1290,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property tempo",
          "id": "obj-94",
          "maxclass": "message",
          "patching_rect": [
            80,
            1740,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-95",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            1740,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend tempo",
          "id": "obj-96",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            1740,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-97",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            1740,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property root_note",
          "id": "obj-98",
          "maxclass": "message",
          "patching_rect": [
            80,
            1830,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-99",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            1830,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend root_note",
          "id": "obj-100",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            1830,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-101",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            1830,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property scale_mode",
          "id": "obj-102",
          "maxclass": "message",
          "patching_rect": [
            80,
            1920,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-103",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            1920,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend scale_mode",
          "id": "obj-104",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            1920,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-105",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            1920,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property scale_intervals",
          "id": "obj-106",
          "maxclass": "message",
          "patching_rect": [
            80,
            2010,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-107",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2010,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend scale_intervals",
          "id": "obj-108",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2010,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-109",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2010,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property scale_name",
          "id": "obj-110",
          "maxclass": "message",
          "patching_rect": [
            80,
            2100,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-111",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2100,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend scale_name",
          "id": "obj-112",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2100,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-113",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2100,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property signature_numerator",
          "id": "obj-114",
          "maxclass": "message",
          "patching_rect": [
            80,
            2190,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-115",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2190,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend signature_numerator",
          "id": "obj-116",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2190,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-117",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2190,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property signature_denominator",
          "id": "obj-118",
          "maxclass": "message",
          "patching_rect": [
            80,
            2280,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-119",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2280,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend signature_denominator",
          "id": "obj-120",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2280,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-121",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2280,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property is_playing",
          "id": "obj-122",
          "maxclass": "message",
          "patching_rect": [
            80,
            2370,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-123",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2370,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend is_playing",
          "id": "obj-124",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2370,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-125",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2370,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "property current_song_time",
          "id": "obj-126",
          "maxclass": "message",
          "patching_rect": [
            80,
            2460,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "live.observer",
          "id": "obj-127",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2460,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend current_song_time",
          "id": "obj-128",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2460,
            220,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend song_context",
          "id": "obj-129",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2460,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Scale display - follow Live when off; expose stored override when on",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-130",
          "maxclass": "comment",
          "patching_rect": [
            80,
            2600,
            600,
            20
          ]
        }
      },
      {
        "box": {
          "text": "prepend set",
          "id": "obj-131",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            2640,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend setsymbol",
          "id": "obj-132",
          "maxclass": "newobj",
          "patching_rect": [
            240,
            2640,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "gate 1",
          "id": "obj-133",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            2730,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "gate 1",
          "id": "obj-134",
          "maxclass": "newobj",
          "patching_rect": [
            240,
            2730,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t i i i",
          "id": "obj-135",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            2640,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "!- 1",
          "id": "obj-136",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            2730,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "sel 0 1",
          "id": "obj-137",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2640,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b",
          "id": "obj-138",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            2640,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b",
          "id": "obj-139",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            2730,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "active 0",
          "id": "obj-140",
          "maxclass": "message",
          "patching_rect": [
            760,
            2640,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "active 1",
          "id": "obj-141",
          "maxclass": "message",
          "patching_rect": [
            760,
            2730,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend set",
          "id": "obj-142",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            2640,
            100,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend setsymbol",
          "id": "obj-143",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            2730,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Tabs - live.tab ➜ thispatcher hide/show Motif vs Settings boxes",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-144",
          "maxclass": "comment",
          "patching_rect": [
            80,
            3160,
            520,
            20
          ]
        }
      },
      {
        "box": {
          "text": "sel 0 1",
          "id": "obj-145",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            3200,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "bang",
          "id": "obj-146",
          "maxclass": "message",
          "patching_rect": [
            220,
            3200,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "bang",
          "id": "obj-147",
          "maxclass": "message",
          "patching_rect": [
            220,
            3290,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b",
          "id": "obj-148",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            3200,
            434,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox version-label hidden 1",
          "id": "obj-149",
          "maxclass": "message",
          "patching_rect": [
            480,
            3200,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox author-label hidden 1",
          "id": "obj-150",
          "maxclass": "message",
          "patching_rect": [
            480,
            3270,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox github-button hidden 1",
          "id": "obj-151",
          "maxclass": "message",
          "patching_rect": [
            480,
            3340,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox trigger-label hidden 1",
          "id": "obj-152",
          "maxclass": "message",
          "patching_rect": [
            480,
            3410,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox trigger-menu hidden 1",
          "id": "obj-153",
          "maxclass": "message",
          "patching_rect": [
            480,
            3480,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox quant-label hidden 1",
          "id": "obj-154",
          "maxclass": "message",
          "patching_rect": [
            480,
            3550,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox quant-menu hidden 1",
          "id": "obj-155",
          "maxclass": "message",
          "patching_rect": [
            480,
            3620,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pass-label hidden 1",
          "id": "obj-156",
          "maxclass": "message",
          "patching_rect": [
            480,
            3690,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pass-menu hidden 1",
          "id": "obj-157",
          "maxclass": "message",
          "patching_rect": [
            480,
            3760,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox meter-label hidden 1",
          "id": "obj-158",
          "maxclass": "message",
          "patching_rect": [
            480,
            3830,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox meter-tab hidden 1",
          "id": "obj-159",
          "maxclass": "message",
          "patching_rect": [
            480,
            3900,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox retrigger-label hidden 1",
          "id": "obj-160",
          "maxclass": "message",
          "patching_rect": [
            480,
            3970,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox retrigger-tab hidden 1",
          "id": "obj-161",
          "maxclass": "message",
          "patching_rect": [
            800,
            3200,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox zone-label hidden 1",
          "id": "obj-162",
          "maxclass": "message",
          "patching_rect": [
            800,
            3270,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox low-number hidden 1",
          "id": "obj-163",
          "maxclass": "message",
          "patching_rect": [
            800,
            3340,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox high-number hidden 1",
          "id": "obj-164",
          "maxclass": "message",
          "patching_rect": [
            800,
            3410,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox repeat-label hidden 1",
          "id": "obj-165",
          "maxclass": "message",
          "patching_rect": [
            800,
            3480,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox repeat-menu hidden 1",
          "id": "obj-166",
          "maxclass": "message",
          "patching_rect": [
            800,
            3550,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox motif-menu hidden 0",
          "id": "obj-167",
          "maxclass": "message",
          "patching_rect": [
            800,
            3620,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox tempo-mult-label hidden 0",
          "id": "obj-168",
          "maxclass": "message",
          "patching_rect": [
            800,
            3690,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox tempo-mult-menu hidden 0",
          "id": "obj-169",
          "maxclass": "message",
          "patching_rect": [
            800,
            3760,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox info-button hidden 0",
          "id": "obj-170",
          "maxclass": "message",
          "patching_rect": [
            800,
            3830,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox panic-button hidden 0",
          "id": "obj-171",
          "maxclass": "message",
          "patching_rect": [
            800,
            3900,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox motif-preview hidden 0",
          "id": "obj-172",
          "maxclass": "message",
          "patching_rect": [
            800,
            3970,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pitch-label hidden 0",
          "id": "obj-173",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3200,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pitch-menu hidden 0",
          "id": "obj-174",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3270,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox invert-button hidden 0",
          "id": "obj-175",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3340,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox reverse-button hidden 0",
          "id": "obj-176",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3410,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox scale-button hidden 0",
          "id": "obj-177",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3480,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox root-display hidden 0",
          "id": "obj-178",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3550,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox scale-name-display hidden 0",
          "id": "obj-179",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3620,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b",
          "id": "obj-180",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            4460,
            434,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox motif-menu hidden 1",
          "id": "obj-181",
          "maxclass": "message",
          "patching_rect": [
            480,
            4460,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox tempo-mult-label hidden 1",
          "id": "obj-182",
          "maxclass": "message",
          "patching_rect": [
            480,
            4530,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox tempo-mult-menu hidden 1",
          "id": "obj-183",
          "maxclass": "message",
          "patching_rect": [
            480,
            4600,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox info-button hidden 1",
          "id": "obj-184",
          "maxclass": "message",
          "patching_rect": [
            480,
            4670,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox panic-button hidden 1",
          "id": "obj-185",
          "maxclass": "message",
          "patching_rect": [
            480,
            4740,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox motif-preview hidden 1",
          "id": "obj-186",
          "maxclass": "message",
          "patching_rect": [
            480,
            4810,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pitch-label hidden 1",
          "id": "obj-187",
          "maxclass": "message",
          "patching_rect": [
            480,
            4880,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pitch-menu hidden 1",
          "id": "obj-188",
          "maxclass": "message",
          "patching_rect": [
            480,
            4950,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox invert-button hidden 1",
          "id": "obj-189",
          "maxclass": "message",
          "patching_rect": [
            480,
            5020,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox reverse-button hidden 1",
          "id": "obj-190",
          "maxclass": "message",
          "patching_rect": [
            480,
            5090,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox scale-button hidden 1",
          "id": "obj-191",
          "maxclass": "message",
          "patching_rect": [
            480,
            5160,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox root-display hidden 1",
          "id": "obj-192",
          "maxclass": "message",
          "patching_rect": [
            480,
            5230,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox scale-name-display hidden 1",
          "id": "obj-193",
          "maxclass": "message",
          "patching_rect": [
            800,
            4460,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox version-label hidden 0",
          "id": "obj-194",
          "maxclass": "message",
          "patching_rect": [
            800,
            4530,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox author-label hidden 0",
          "id": "obj-195",
          "maxclass": "message",
          "patching_rect": [
            800,
            4600,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox github-button hidden 0",
          "id": "obj-196",
          "maxclass": "message",
          "patching_rect": [
            800,
            4670,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox trigger-label hidden 0",
          "id": "obj-197",
          "maxclass": "message",
          "patching_rect": [
            800,
            4740,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox trigger-menu hidden 0",
          "id": "obj-198",
          "maxclass": "message",
          "patching_rect": [
            800,
            4810,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox quant-label hidden 0",
          "id": "obj-199",
          "maxclass": "message",
          "patching_rect": [
            800,
            4880,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox quant-menu hidden 0",
          "id": "obj-200",
          "maxclass": "message",
          "patching_rect": [
            800,
            4950,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pass-label hidden 0",
          "id": "obj-201",
          "maxclass": "message",
          "patching_rect": [
            800,
            5020,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox pass-menu hidden 0",
          "id": "obj-202",
          "maxclass": "message",
          "patching_rect": [
            800,
            5090,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox meter-label hidden 0",
          "id": "obj-203",
          "maxclass": "message",
          "patching_rect": [
            800,
            5160,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox meter-tab hidden 0",
          "id": "obj-204",
          "maxclass": "message",
          "patching_rect": [
            800,
            5230,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox retrigger-label hidden 0",
          "id": "obj-205",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4460,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox retrigger-tab hidden 0",
          "id": "obj-206",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4530,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox zone-label hidden 0",
          "id": "obj-207",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4600,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox low-number hidden 0",
          "id": "obj-208",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4670,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox high-number hidden 0",
          "id": "obj-209",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4740,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox repeat-label hidden 0",
          "id": "obj-210",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4810,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "script sendbox repeat-menu hidden 0",
          "id": "obj-211",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4880,
            260,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Library/Authoring - pcontrol float (search, clip import, note edit)",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-212",
          "maxclass": "comment",
          "patching_rect": [
            2000,
            3160,
            480,
            20
          ]
        }
      },
      {
        "box": {
          "text": "p library-info",
          "patcher": {
            "fileversion": 1,
            "appversion": {
              "major": 9,
              "minor": 0,
              "revision": 0,
              "architecture": "x64",
              "modernui": 1
            },
            "classnamespace": "box",
            "rect": [
              100,
              100,
              800,
              640
            ],
            "bglocked": 0,
            "openinpresentation": 1,
            "default_fontsize": 10,
            "default_fontface": 0,
            "default_fontname": "Ableton Sans",
            "gridonopen": 1,
            "gridsize": [
              20,
              20
            ],
            "gridsnaponopen": 1,
            "objectsnaponopen": 1,
            "statusbarvisible": 2,
            "toolbarvisible": 1,
            "boxes": [
              {
                "box": {
                  "presentation": 1,
                  "presentation_rect": [
                    0,
                    0,
                    800,
                    640
                  ],
                  "rendermode": 1,
                  "varname": "jweb-library",
                  "id": "obj-213",
                  "maxclass": "jweb",
                  "patching_rect": [
                    0,
                    0,
                    800,
                    640
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-214",
                  "maxclass": "inlet",
                  "patching_rect": [
                    20,
                    20,
                    40,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "thispatcher",
                  "id": "obj-215",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    500,
                    90,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "route library_page",
                  "id": "obj-216",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    464,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "prepend readfile",
                  "id": "obj-217",
                  "maxclass": "newobj",
                  "patching_rect": [
                    210,
                    464,
                    120,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "loadmess presentation 1",
                  "id": "obj-218",
                  "maxclass": "newobj",
                  "patching_rect": [
                    140,
                    500,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "loadmess window size 800 640",
                  "id": "obj-219",
                  "maxclass": "newobj",
                  "patching_rect": [
                    320,
                    500,
                    180,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "loadmess title \"Motif Library\"",
                  "id": "obj-220",
                  "maxclass": "newobj",
                  "patching_rect": [
                    520,
                    500,
                    210,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "receive ---lib-data",
                  "id": "obj-221",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    536,
                    170,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "route choose_library library_ready web_debug lib_action url title",
                  "id": "obj-222",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    608,
                    500,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "opendialog fold",
                  "id": "obj-223",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    644,
                    120,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "send ---library_path",
                  "id": "obj-224",
                  "maxclass": "newobj",
                  "patching_rect": [
                    180,
                    644,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "library_ready",
                  "id": "obj-225",
                  "maxclass": "message",
                  "patching_rect": [
                    320,
                    644,
                    110,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "prepend lib_action",
                  "id": "obj-226",
                  "maxclass": "newobj",
                  "patching_rect": [
                    450,
                    608,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "send ---motif_author",
                  "id": "obj-227",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    608,
                    170,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "send ---motif_web_debug",
                  "id": "obj-228",
                  "maxclass": "newobj",
                  "patching_rect": [
                    450,
                    644,
                    190,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "prepend library-url",
                  "id": "obj-229",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    680,
                    150,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "prepend library-title",
                  "id": "obj-230",
                  "maxclass": "newobj",
                  "patching_rect": [
                    200,
                    680,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "print Motif-jweb",
                  "id": "obj-231",
                  "maxclass": "newobj",
                  "patching_rect": [
                    400,
                    680,
                    140,
                    22
                  ]
                }
              },
              {
                "box": {
                  "text": "prepend library-unhandled",
                  "id": "obj-232",
                  "maxclass": "newobj",
                  "patching_rect": [
                    560,
                    680,
                    190,
                    22
                  ]
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "obj-218",
                    0
                  ],
                  "destination": [
                    "obj-215",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-219",
                    0
                  ],
                  "destination": [
                    "obj-215",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-220",
                    0
                  ],
                  "destination": [
                    "obj-215",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-214",
                    0
                  ],
                  "destination": [
                    "obj-216",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-216",
                    0
                  ],
                  "destination": [
                    "obj-217",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-217",
                    0
                  ],
                  "destination": [
                    "obj-213",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-216",
                    1
                  ],
                  "destination": [
                    "obj-215",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-221",
                    0
                  ],
                  "destination": [
                    "obj-213",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-213",
                    0
                  ],
                  "destination": [
                    "obj-222",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    0
                  ],
                  "destination": [
                    "obj-223",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-223",
                    0
                  ],
                  "destination": [
                    "obj-224",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    1
                  ],
                  "destination": [
                    "obj-225",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-225",
                    0
                  ],
                  "destination": [
                    "obj-227",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    2
                  ],
                  "destination": [
                    "obj-228",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    3
                  ],
                  "destination": [
                    "obj-226",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    4
                  ],
                  "destination": [
                    "obj-229",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    5
                  ],
                  "destination": [
                    "obj-230",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-229",
                    0
                  ],
                  "destination": [
                    "obj-231",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-230",
                    0
                  ],
                  "destination": [
                    "obj-231",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-222",
                    6
                  ],
                  "destination": [
                    "obj-232",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-232",
                    0
                  ],
                  "destination": [
                    "obj-231",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-226",
                    0
                  ],
                  "destination": [
                    "obj-227",
                    0
                  ]
                }
              }
            ],
            "dependency_cache": [],
            "autosave": 0
          },
          "id": "obj-233",
          "maxclass": "newobj",
          "patching_rect": [
            2000,
            3650,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pcontrol",
          "id": "obj-234",
          "maxclass": "newobj",
          "patching_rect": [
            2000,
            3470,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b",
          "id": "obj-235",
          "maxclass": "newobj",
          "patching_rect": [
            2000,
            3200,
            70,
            22
          ]
        }
      },
      {
        "box": {
          "text": "close",
          "id": "obj-236",
          "maxclass": "message",
          "patching_rect": [
            2100,
            3200,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "deferlow",
          "id": "obj-237",
          "maxclass": "newobj",
          "patching_rect": [
            2100,
            3290,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b",
          "id": "obj-238",
          "maxclass": "newobj",
          "patching_rect": [
            2200,
            3200,
            120,
            22
          ]
        }
      },
      {
        "box": {
          "text": "window flags float nogrow close zoom",
          "id": "obj-239",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3200,
            230,
            22
          ]
        }
      },
      {
        "box": {
          "text": "window size 800 640",
          "id": "obj-240",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3290,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "window size 800 640",
          "id": "obj-241",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3380,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "window exec",
          "id": "obj-242",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3470,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "open",
          "id": "obj-243",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3560,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "deferlow",
          "id": "obj-244",
          "maxclass": "newobj",
          "patching_rect": [
            2320,
            3560,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "library_prepare",
          "id": "obj-245",
          "maxclass": "message",
          "patching_rect": [
            2420,
            3560,
            120,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend library_page",
          "id": "obj-246",
          "maxclass": "newobj",
          "patching_rect": [
            2560,
            3560,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "text": "deferlow",
          "id": "obj-247",
          "maxclass": "newobj",
          "patching_rect": [
            2400,
            3380,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "receive ---library_path",
          "id": "obj-248",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3200,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pattr motif_library_path @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                ""
              ],
              "parameter_initial_enable": 1,
              "parameter_invisible": 1,
              "parameter_longname": "Motif Library Path",
              "parameter_shortname": "Library",
              "parameter_type": 3
            }
          },
          "saved_object_attributes": {
            "parameter_enable": 1,
            "parameter_mappable": 0
          },
          "varname": "motif_library_path",
          "id": "obj-249",
          "maxclass": "newobj",
          "patching_rect": [
            2640,
            3200,
            520,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend library_path",
          "id": "obj-250",
          "maxclass": "newobj",
          "patching_rect": [
            3200,
            3200,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "text": "bang",
          "id": "obj-251",
          "maxclass": "message",
          "patching_rect": [
            2640,
            3290,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "pattr motif_device_state @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                "%7B%22schemaVersion%22%3A1%2C%22selectedMotifId%22%3A%22scale-turn%22%2C%22hotkeys%22%3A%5B%5D%7D"
              ],
              "parameter_initial_enable": 1,
              "parameter_invisible": 1,
              "parameter_longname": "Motif Device State",
              "parameter_shortname": "State",
              "parameter_type": 3
            }
          },
          "saved_object_attributes": {
            "parameter_enable": 1,
            "parameter_mappable": 0
          },
          "varname": "motif_device_state",
          "id": "obj-252",
          "maxclass": "newobj",
          "patching_rect": [
            2640,
            3380,
            520,
            22
          ]
        }
      },
      {
        "box": {
          "text": "bang",
          "id": "obj-253",
          "maxclass": "message",
          "patching_rect": [
            2760,
            3290,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend restore_state",
          "id": "obj-254",
          "maxclass": "newobj",
          "patching_rect": [
            3200,
            3290,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "receive ---motif_author",
          "id": "obj-255",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3290,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "deferlow",
          "id": "obj-256",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3380,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "text": "receive ---motif_web_debug",
          "id": "obj-257",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3380,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend web_debug",
          "id": "obj-258",
          "maxclass": "newobj",
          "patching_rect": [
            2680,
            3380,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "text": "§ Controls ➜ v8 - Live parameters + post-restore synchronization",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0,
          "id": "obj-259",
          "maxclass": "comment",
          "patching_rect": [
            80,
            4760,
            480,
            20
          ]
        }
      },
      {
        "box": {
          "text": "prepend motif",
          "id": "obj-260",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            4800,
            110,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend pitch_mode",
          "id": "obj-261",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            4800,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend scale_override",
          "id": "obj-262",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            4980,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend scale_override_root",
          "id": "obj-263",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            4980,
            200,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend scale_override_name",
          "id": "obj-264",
          "maxclass": "newobj",
          "patching_rect": [
            510,
            4980,
            210,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend invert",
          "id": "obj-265",
          "maxclass": "newobj",
          "patching_rect": [
            480,
            4800,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend reverse",
          "id": "obj-266",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            4800,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend tempo_multiplier",
          "id": "obj-267",
          "maxclass": "newobj",
          "patching_rect": [
            820,
            4800,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend trigger_mode",
          "id": "obj-268",
          "maxclass": "newobj",
          "patching_rect": [
            1080,
            4800,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend repeat_rounding",
          "id": "obj-269",
          "maxclass": "newobj",
          "patching_rect": [
            1260,
            4890,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend launch_quantization",
          "id": "obj-270",
          "maxclass": "newobj",
          "patching_rect": [
            1320,
            4800,
            200,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend pass_through",
          "id": "obj-271",
          "maxclass": "newobj",
          "patching_rect": [
            1580,
            4800,
            170,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend meter_mode",
          "id": "obj-272",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            4890,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend retrigger",
          "id": "obj-273",
          "maxclass": "newobj",
          "patching_rect": [
            320,
            4890,
            140,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend trigger_low",
          "id": "obj-274",
          "maxclass": "newobj",
          "patching_rect": [
            560,
            4890,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "prepend trigger_high",
          "id": "obj-275",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            4890,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "text": "panic",
          "id": "obj-276",
          "maxclass": "message",
          "patching_rect": [
            1060,
            4890,
            60,
            22
          ]
        }
      },
      {
        "box": {
          "text": "; max launchbrowser https://github.com/MatthewCallis/motif-m4l",
          "id": "obj-277",
          "maxclass": "message",
          "patching_rect": [
            1060,
            4980,
            430,
            22
          ]
        }
      },
      {
        "box": {
          "text": "t b b b b b b b b b b b b b b b b",
          "id": "obj-278",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            5070,
            320,
            22
          ]
        }
      },
      {
        "box": {
          "text": "outputvalue",
          "id": "obj-279",
          "maxclass": "message",
          "patching_rect": [
            360,
            5070,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "outputvalue",
          "id": "obj-280",
          "maxclass": "message",
          "patching_rect": [
            360,
            5070,
            90,
            22
          ]
        }
      },
      {
        "box": {
          "text": "outputvalue",
          "id": "obj-281",
          "maxclass": "message",
          "patching_rect": [
            480,
            5070,
            90,
            22
          ]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-83",
            0
          ],
          "destination": [
            "obj-94",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-94",
            0
          ],
          "destination": [
            "obj-95",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-95",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-95",
            0
          ],
          "destination": [
            "obj-96",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-96",
            0
          ],
          "destination": [
            "obj-97",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-97",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            1
          ],
          "destination": [
            "obj-98",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-98",
            0
          ],
          "destination": [
            "obj-99",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-99",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-99",
            0
          ],
          "destination": [
            "obj-100",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-100",
            0
          ],
          "destination": [
            "obj-101",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-101",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            2
          ],
          "destination": [
            "obj-102",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-102",
            0
          ],
          "destination": [
            "obj-103",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-103",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-103",
            0
          ],
          "destination": [
            "obj-104",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-104",
            0
          ],
          "destination": [
            "obj-105",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-105",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            3
          ],
          "destination": [
            "obj-106",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-106",
            0
          ],
          "destination": [
            "obj-107",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-107",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-107",
            0
          ],
          "destination": [
            "obj-108",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-108",
            0
          ],
          "destination": [
            "obj-109",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-109",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            4
          ],
          "destination": [
            "obj-110",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-110",
            0
          ],
          "destination": [
            "obj-111",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-111",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-111",
            0
          ],
          "destination": [
            "obj-112",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-112",
            0
          ],
          "destination": [
            "obj-113",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-113",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            5
          ],
          "destination": [
            "obj-114",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-114",
            0
          ],
          "destination": [
            "obj-115",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-115",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-115",
            0
          ],
          "destination": [
            "obj-116",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-116",
            0
          ],
          "destination": [
            "obj-117",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-117",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            6
          ],
          "destination": [
            "obj-118",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-118",
            0
          ],
          "destination": [
            "obj-119",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-119",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-119",
            0
          ],
          "destination": [
            "obj-120",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-120",
            0
          ],
          "destination": [
            "obj-121",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-121",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            7
          ],
          "destination": [
            "obj-122",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-122",
            0
          ],
          "destination": [
            "obj-123",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-123",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-123",
            0
          ],
          "destination": [
            "obj-124",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-124",
            0
          ],
          "destination": [
            "obj-125",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-125",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            8
          ],
          "destination": [
            "obj-126",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-126",
            0
          ],
          "destination": [
            "obj-127",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
            0
          ],
          "destination": [
            "obj-127",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            0
          ],
          "destination": [
            "obj-128",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-128",
            0
          ],
          "destination": [
            "obj-129",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-129",
            0
          ],
          "destination": [
            "obj-87",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-99",
            0
          ],
          "destination": [
            "obj-133",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-133",
            0
          ],
          "destination": [
            "obj-131",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            0
          ],
          "destination": [
            "obj-13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-111",
            0
          ],
          "destination": [
            "obj-134",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            0
          ],
          "destination": [
            "obj-132",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-132",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-12",
            0
          ],
          "destination": [
            "obj-135",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-135",
            2
          ],
          "destination": [
            "obj-136",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-136",
            0
          ],
          "destination": [
            "obj-133",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-136",
            0
          ],
          "destination": [
            "obj-134",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-135",
            1
          ],
          "destination": [
            "obj-137",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-137",
            0
          ],
          "destination": [
            "obj-138",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-137",
            1
          ],
          "destination": [
            "obj-139",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-138",
            2
          ],
          "destination": [
            "obj-99",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-138",
            1
          ],
          "destination": [
            "obj-111",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-138",
            0
          ],
          "destination": [
            "obj-140",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-140",
            0
          ],
          "destination": [
            "obj-13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-140",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-139",
            2
          ],
          "destination": [
            "obj-15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-139",
            1
          ],
          "destination": [
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-139",
            0
          ],
          "destination": [
            "obj-141",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-141",
            0
          ],
          "destination": [
            "obj-13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-141",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-15",
            0
          ],
          "destination": [
            "obj-142",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-142",
            0
          ],
          "destination": [
            "obj-13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-16",
            1
          ],
          "destination": [
            "obj-143",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-143",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-13",
            0
          ],
          "destination": [
            "obj-15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-14",
            0
          ],
          "destination": [
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-81",
            0
          ],
          "destination": [
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-82",
            2
          ],
          "destination": [
            "obj-83",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-82",
            1
          ],
          "destination": [
            "obj-84",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-82",
            0
          ],
          "destination": [
            "obj-85",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-85",
            0
          ],
          "destination": [
            "obj-86",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-86",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-87",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            3
          ],
          "destination": [
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-88",
            0
          ],
          "destination": [
            "obj-89",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-89",
            1
          ],
          "destination": [
            "obj-39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-39",
            0
          ],
          "destination": [
            "obj-37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-89",
            0
          ],
          "destination": [
            "obj-90",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            0
          ],
          "destination": [
            "obj-95",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            1
          ],
          "destination": [
            "obj-99",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            2
          ],
          "destination": [
            "obj-103",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            3
          ],
          "destination": [
            "obj-107",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            4
          ],
          "destination": [
            "obj-111",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            5
          ],
          "destination": [
            "obj-115",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            6
          ],
          "destination": [
            "obj-119",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            7
          ],
          "destination": [
            "obj-123",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-90",
            8
          ],
          "destination": [
            "obj-127",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-93",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-91",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-1",
            0
          ],
          "destination": [
            "obj-145",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-145",
            0
          ],
          "destination": [
            "obj-146",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-145",
            1
          ],
          "destination": [
            "obj-147",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-146",
            0
          ],
          "destination": [
            "obj-148",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            0
          ],
          "destination": [
            "obj-149",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-149",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            1
          ],
          "destination": [
            "obj-150",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-150",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            2
          ],
          "destination": [
            "obj-151",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-151",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            3
          ],
          "destination": [
            "obj-152",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-152",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            4
          ],
          "destination": [
            "obj-153",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            5
          ],
          "destination": [
            "obj-154",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-154",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            6
          ],
          "destination": [
            "obj-155",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-155",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            7
          ],
          "destination": [
            "obj-156",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-156",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            8
          ],
          "destination": [
            "obj-157",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-157",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            9
          ],
          "destination": [
            "obj-158",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-158",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            10
          ],
          "destination": [
            "obj-159",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-159",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            11
          ],
          "destination": [
            "obj-160",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-160",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            12
          ],
          "destination": [
            "obj-161",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            13
          ],
          "destination": [
            "obj-162",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-162",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            14
          ],
          "destination": [
            "obj-163",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-163",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            15
          ],
          "destination": [
            "obj-164",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-164",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            16
          ],
          "destination": [
            "obj-165",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-165",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            17
          ],
          "destination": [
            "obj-166",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-166",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            18
          ],
          "destination": [
            "obj-167",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-167",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            19
          ],
          "destination": [
            "obj-168",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-168",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            20
          ],
          "destination": [
            "obj-169",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-169",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            21
          ],
          "destination": [
            "obj-170",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-170",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            22
          ],
          "destination": [
            "obj-171",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-171",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            23
          ],
          "destination": [
            "obj-172",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-172",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            24
          ],
          "destination": [
            "obj-173",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-173",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            25
          ],
          "destination": [
            "obj-174",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-174",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            26
          ],
          "destination": [
            "obj-175",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-175",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            27
          ],
          "destination": [
            "obj-176",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-176",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            28
          ],
          "destination": [
            "obj-177",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-177",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            29
          ],
          "destination": [
            "obj-178",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-178",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-148",
            30
          ],
          "destination": [
            "obj-179",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-179",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-147",
            0
          ],
          "destination": [
            "obj-180",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            0
          ],
          "destination": [
            "obj-181",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-181",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            1
          ],
          "destination": [
            "obj-182",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-182",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            2
          ],
          "destination": [
            "obj-183",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-183",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            3
          ],
          "destination": [
            "obj-184",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-184",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            4
          ],
          "destination": [
            "obj-185",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-185",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            5
          ],
          "destination": [
            "obj-186",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-186",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            6
          ],
          "destination": [
            "obj-187",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-187",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            7
          ],
          "destination": [
            "obj-188",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-188",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            8
          ],
          "destination": [
            "obj-189",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-189",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            9
          ],
          "destination": [
            "obj-190",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-190",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            10
          ],
          "destination": [
            "obj-191",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-191",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            11
          ],
          "destination": [
            "obj-192",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-192",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            12
          ],
          "destination": [
            "obj-193",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-193",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            13
          ],
          "destination": [
            "obj-194",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-194",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            14
          ],
          "destination": [
            "obj-195",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-195",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            15
          ],
          "destination": [
            "obj-196",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-196",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            16
          ],
          "destination": [
            "obj-197",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-197",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            17
          ],
          "destination": [
            "obj-198",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-198",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            18
          ],
          "destination": [
            "obj-199",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-199",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            19
          ],
          "destination": [
            "obj-200",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-200",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            20
          ],
          "destination": [
            "obj-201",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-201",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            21
          ],
          "destination": [
            "obj-202",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-202",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            22
          ],
          "destination": [
            "obj-203",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-203",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            23
          ],
          "destination": [
            "obj-204",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-204",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            24
          ],
          "destination": [
            "obj-205",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-205",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            25
          ],
          "destination": [
            "obj-206",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-206",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            26
          ],
          "destination": [
            "obj-207",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-207",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            27
          ],
          "destination": [
            "obj-208",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-208",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            28
          ],
          "destination": [
            "obj-209",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-209",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            29
          ],
          "destination": [
            "obj-210",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-210",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-180",
            30
          ],
          "destination": [
            "obj-211",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-211",
            0
          ],
          "destination": [
            "obj-92",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-5",
            0
          ],
          "destination": [
            "obj-235",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-235",
            1
          ],
          "destination": [
            "obj-236",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-235",
            0
          ],
          "destination": [
            "obj-237",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-237",
            0
          ],
          "destination": [
            "obj-238",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-238",
            5
          ],
          "destination": [
            "obj-239",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-238",
            4
          ],
          "destination": [
            "obj-240",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-238",
            3
          ],
          "destination": [
            "obj-242",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-238",
            2
          ],
          "destination": [
            "obj-243",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-238",
            1
          ],
          "destination": [
            "obj-244",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-238",
            0
          ],
          "destination": [
            "obj-247",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-244",
            0
          ],
          "destination": [
            "obj-245",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-245",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-247",
            0
          ],
          "destination": [
            "obj-241",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-239",
            0
          ],
          "destination": [
            "obj-233",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-240",
            0
          ],
          "destination": [
            "obj-233",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-241",
            0
          ],
          "destination": [
            "obj-233",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-242",
            0
          ],
          "destination": [
            "obj-233",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-236",
            0
          ],
          "destination": [
            "obj-234",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-243",
            0
          ],
          "destination": [
            "obj-234",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-234",
            0
          ],
          "destination": [
            "obj-233",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-248",
            0
          ],
          "destination": [
            "obj-249",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-248",
            0
          ],
          "destination": [
            "obj-250",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-249",
            0
          ],
          "destination": [
            "obj-250",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-250",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-251",
            0
          ],
          "destination": [
            "obj-249",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-253",
            0
          ],
          "destination": [
            "obj-252",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-252",
            0
          ],
          "destination": [
            "obj-254",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-254",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-255",
            0
          ],
          "destination": [
            "obj-256",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-256",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-257",
            0
          ],
          "destination": [
            "obj-258",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-258",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-36",
            0
          ],
          "destination": [
            "obj-37",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-38",
            0
          ],
          "destination": [
            "obj-37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-37",
            0
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-37",
            1
          ],
          "destination": [
            "obj-40",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-37",
            1
          ],
          "destination": [
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-40",
            7
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-40",
            0
          ],
          "destination": [
            "obj-42",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-40",
            6
          ],
          "destination": [
            "obj-43",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-42",
            1
          ],
          "destination": [
            "obj-43",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-42",
            0
          ],
          "destination": [
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-43",
            0
          ],
          "destination": [
            "obj-44",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-44",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-41",
            6
          ],
          "destination": [
            "obj-46",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-41",
            2
          ],
          "destination": [
            "obj-45",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-45",
            0
          ],
          "destination": [
            "obj-46",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-46",
            0
          ],
          "destination": [
            "obj-47",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-47",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-51",
            0
          ],
          "destination": [
            "obj-52",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            0
          ],
          "destination": [
            "obj-53",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-53",
            0
          ],
          "destination": [
            "obj-54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-53",
            1
          ],
          "destination": [
            "obj-54",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-53",
            2
          ],
          "destination": [
            "obj-54",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-53",
            3
          ],
          "destination": [
            "obj-54",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-54",
            2
          ],
          "destination": [
            "obj-56",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-54",
            1
          ],
          "destination": [
            "obj-55",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-54",
            0
          ],
          "destination": [
            "obj-55",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-55",
            0
          ],
          "destination": [
            "obj-56",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            0
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-48",
            0
          ],
          "destination": [
            "obj-49",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            1
          ],
          "destination": [
            "obj-57",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-57",
            2
          ],
          "destination": [
            "obj-59",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-57",
            1
          ],
          "destination": [
            "obj-60",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-57",
            0
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            2
          ],
          "destination": [
            "obj-61",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
            1
          ],
          "destination": [
            "obj-63",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
            0
          ],
          "destination": [
            "obj-62",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-62",
            0
          ],
          "destination": [
            "obj-63",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-63",
            0
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            2
          ],
          "destination": [
            "obj-58",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-58",
            1
          ],
          "destination": [
            "obj-59",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-58",
            0
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            0
          ],
          "destination": [
            "obj-54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            6
          ],
          "destination": [
            "obj-65",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-65",
            0
          ],
          "destination": [
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            7
          ],
          "destination": [
            "obj-66",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            0
          ],
          "destination": [
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            8
          ],
          "destination": [
            "obj-67",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-67",
            0
          ],
          "destination": [
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            10
          ],
          "destination": [
            "obj-68",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            11
          ],
          "destination": [
            "obj-246",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-246",
            0
          ],
          "destination": [
            "obj-233",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            12
          ],
          "destination": [
            "obj-252",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-68",
            0
          ],
          "destination": [
            "obj-69",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-69",
            0
          ],
          "destination": [
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-68",
            1
          ],
          "destination": [
            "obj-71",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-71",
            0
          ],
          "destination": [
            "obj-7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-68",
            2
          ],
          "destination": [
            "obj-77",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-77",
            0
          ],
          "destination": [
            "obj-78",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-78",
            0
          ],
          "destination": [
            "obj-10",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-77",
            1
          ],
          "destination": [
            "obj-79",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-79",
            0
          ],
          "destination": [
            "obj-11",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-7",
            0
          ],
          "destination": [
            "obj-72",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-72",
            0
          ],
          "destination": [
            "obj-73",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-73",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-89",
            2
          ],
          "destination": [
            "obj-74",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-74",
            0
          ],
          "destination": [
            "obj-7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-72",
            1
          ],
          "destination": [
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-75",
            0
          ],
          "destination": [
            "obj-76",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-76",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-2",
            1
          ],
          "destination": [
            "obj-260",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-260",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-9",
            1
          ],
          "destination": [
            "obj-261",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-261",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-135",
            0
          ],
          "destination": [
            "obj-262",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-262",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-15",
            0
          ],
          "destination": [
            "obj-263",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-263",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-16",
            1
          ],
          "destination": [
            "obj-264",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-264",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-10",
            0
          ],
          "destination": [
            "obj-265",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-265",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-11",
            0
          ],
          "destination": [
            "obj-266",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-266",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            1
          ],
          "destination": [
            "obj-267",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-267",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            1
          ],
          "destination": [
            "obj-268",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-268",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-33",
            1
          ],
          "destination": [
            "obj-269",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-269",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-28",
            1
          ],
          "destination": [
            "obj-270",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-270",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-29",
            1
          ],
          "destination": [
            "obj-271",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-271",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-30",
            1
          ],
          "destination": [
            "obj-272",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-272",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-31",
            1
          ],
          "destination": [
            "obj-273",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-273",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-32",
            0
          ],
          "destination": [
            "obj-274",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-274",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
            0
          ],
          "destination": [
            "obj-275",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-275",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-6",
            0
          ],
          "destination": [
            "obj-276",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-276",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-19",
            0
          ],
          "destination": [
            "obj-277",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            0
          ],
          "destination": [
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            1
          ],
          "destination": [
            "obj-4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            2
          ],
          "destination": [
            "obj-27",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            3
          ],
          "destination": [
            "obj-28",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            4
          ],
          "destination": [
            "obj-29",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            5
          ],
          "destination": [
            "obj-30",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            6
          ],
          "destination": [
            "obj-31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            7
          ],
          "destination": [
            "obj-34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            8
          ],
          "destination": [
            "obj-32",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            9
          ],
          "destination": [
            "obj-33",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            10
          ],
          "destination": [
            "obj-1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            11
          ],
          "destination": [
            "obj-279",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-279",
            0
          ],
          "destination": [
            "obj-12",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            12
          ],
          "destination": [
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            13
          ],
          "destination": [
            "obj-15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            14
          ],
          "destination": [
            "obj-280",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-280",
            0
          ],
          "destination": [
            "obj-10",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-278",
            15
          ],
          "destination": [
            "obj-281",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-281",
            0
          ],
          "destination": [
            "obj-11",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-82",
            5
          ],
          "destination": [
            "obj-251",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-82",
            4
          ],
          "destination": [
            "obj-253",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-82",
            3
          ],
          "destination": [
            "obj-278",
            0
          ]
        }
      }
    ],
    "dependency_cache": [
      {
        "name": "motif-device-5a7f1e14fb82.js",
        "bootpath": ".",
        "patcherrelativepath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "motif-preview-80e1cedd19c3.js",
        "bootpath": ".",
        "patcherrelativepath": ".",
        "type": "TEXT",
        "implicit": 1
      }
    ],
    "autosave": 0
  }
}
