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
    "devicewidth": 480,
    "description": "Scale-aware triggerable motif engine with native Live Song synchronization and visual note preview",
    "digest": "Motif/Settings tabs; native Song observers; fail-open MIDI; BPM multiplier; Library authoring popup",
    "tags": "midi motif phrase scale preview",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "live.tab",
          "patching_rect": [
            8,
            4,
            96,
            20
          ],
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
            8,
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
          "hint": "Switch between the Motif performance view and Settings for less-used controls."
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "umenu",
          "patching_rect": [
            112,
            4,
            176,
            20
          ],
          "items": [
            "Loading…"
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
            112,
            4,
            176,
            20
          ],
          "varname": "motif-menu",
          "hidden": 0,
          "annotation_name": "Selected Motif",
          "annotation": "Choose the phrase played when a trigger note is received. The preview updates immediately.",
          "hint": "Choose the phrase played when a trigger note is received. The preview updates immediately."
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "live.comment",
          "patching_rect": [
            312,
            5,
            35,
            20
          ],
          "text": "BPM ×",
          "presentation": 1,
          "presentation_rect": [
            312,
            5,
            35,
            20
          ],
          "varname": "tempo-mult-label",
          "hidden": 0
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "live.menu",
          "patching_rect": [
            356,
            6.5,
            32,
            20
          ],
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
          "annotation": "Multiplies Live’s Song tempo for motif scheduling only. Does not change the Live Set tempo. Default is 1.",
          "hint": "Multiplies Live’s Song tempo for motif scheduling only. Does not change the Live Set tempo. Default is 1."
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "live.text",
          "patching_rect": [
            396,
            4,
            32,
            20
          ],
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 0,
          "outputmode": 1,
          "parameter_enable": 0,
          "text": "Info",
          "texton": "Info",
          "presentation": 1,
          "presentation_rect": [
            396,
            4,
            32,
            20
          ],
          "varname": "info-button",
          "hidden": 0,
          "annotation_name": "Library & Authoring",
          "annotation": "Open the floating library browser: search motifs, import a Live clip, edit notes, and save JSON.",
          "hint": "Open the floating library browser: search motifs, import a Live clip, edit notes, and save JSON."
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "live.text",
          "patching_rect": [
            432,
            4,
            40,
            20
          ],
          "appearance": 0,
          "fontname": "Ableton Sans",
          "fontsize": 10,
          "mode": 0,
          "outputmode": 1,
          "parameter_enable": 0,
          "text": "Panic",
          "texton": "Panic",
          "presentation": 1,
          "presentation_rect": [
            432,
            4,
            40,
            20
          ],
          "varname": "panic-button",
          "hidden": 0,
          "annotation_name": "Panic",
          "annotation": "Immediately clears scheduled phrase events and sends note-offs for active MIDI notes.",
          "hint": "Immediately clears scheduled phrase events and sends note-offs for active MIDI notes."
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "panel",
          "patching_rect": [
            8,
            28,
            464,
            100
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            0.08,
            0.08,
            0.09,
            1
          ],
          "rounded": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            28,
            464,
            100
          ],
          "varname": "ui-preview-panel",
          "hidden": 0
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "jsui",
          "patching_rect": [
            12,
            32,
            456,
            92
          ],
          "filename": "motif-preview.js",
          "border": 0,
          "ignoreclick": 0,
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            12,
            32,
            456,
            92
          ],
          "varname": "motif-preview",
          "hidden": 0,
          "annotation_name": "Motif Note Preview",
          "annotation": "A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, BPM multiplier, and most recent trigger note.",
          "hint": "A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, BPM multiplier, and most recent trigger note."
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "live.comment",
          "patching_rect": [
            8,
            146.5,
            40,
            18
          ],
          "text": "Pitch",
          "presentation": 1,
          "presentation_rect": [
            8,
            146.5,
            40,
            18
          ],
          "varname": "pitch-label",
          "hidden": 0
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "live.menu",
          "patching_rect": [
            52,
            148,
            88,
            18
          ],
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            52,
            148,
            88,
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
          "annotation": "Motif uses the phrase’s stored pitch mode. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.",
          "hint": "Motif uses the phrase’s stored pitch mode. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals."
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "live.comment",
          "patching_rect": [
            148,
            146.5,
            44,
            18
          ],
          "text": "Scale",
          "presentation": 1,
          "presentation_rect": [
            148,
            146.5,
            44,
            18
          ],
          "varname": "scale-label",
          "hidden": 0
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "live.menu",
          "patching_rect": [
            196,
            148,
            40,
            18
          ],
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            196,
            148,
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
              "parameter_longname": "Live Scale Root",
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
          "varname": "root-display",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 1,
          "hidden": 0,
          "annotation_name": "Live Scale Root",
          "annotation": "Live Set's current scale root, observed from Song.root_note. Dimmed when Scale Mode is off.",
          "hint": "Live Set's current scale root, observed from Song.root_note. Dimmed when Scale Mode is off."
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "live.menu",
          "patching_rect": [
            240,
            148,
            132,
            18
          ],
          "appearance": 0,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            240,
            148,
            132,
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
                "Spanish",
                "Bhairav",
                "Hungarian Minor",
                "Chinese",
                "Hirajoshi",
                "In-Sen",
                "Iwato",
                "Kumoi",
                "Pelog",
                "Messiaen 3",
                "Messiaen 4",
                "Messiaen 5",
                "Messiaen 6",
                "Messiaen 7"
              ],
              "parameter_longname": "Live Scale Name",
              "parameter_mmax": 34,
              "parameter_shortname": "Scale",
              "parameter_type": 2,
              "parameter_unitstyle": 9,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "varname": "scale-name-display",
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "ignoreclick": 1,
          "hidden": 0,
          "annotation_name": "Live Scale Name",
          "annotation": "Live Set's current scale name, observed from Song.scale_name. Dimmed when Scale Mode is off.",
          "hint": "Live Set's current scale name, observed from Song.scale_name. Dimmed when Scale Mode is off."
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "comment",
          "patching_rect": [
            8,
            30,
            80,
            16
          ],
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
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "comment",
          "patching_rect": [
            8,
            52,
            80,
            16
          ],
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
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "comment",
          "patching_rect": [
            8,
            74,
            80,
            16
          ],
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
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "obj-17",
          "maxclass": "comment",
          "patching_rect": [
            8,
            96,
            80,
            16
          ],
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
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "comment",
          "patching_rect": [
            8,
            118,
            80,
            16
          ],
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
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "obj-19",
          "maxclass": "comment",
          "patching_rect": [
            8,
            140,
            80,
            16
          ],
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
          "hidden": 1
        }
      },
      {
        "box": {
          "id": "obj-20",
          "maxclass": "live.menu",
          "patching_rect": [
            96,
            28,
            232,
            20
          ],
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
                "one-shot",
                "hold",
                "toggle",
                "latch",
                "release-tail"
              ],
              "parameter_longname": "Trigger Mode",
              "parameter_mmax": 4,
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
          "annotation": "One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish.",
          "hint": "One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish."
        }
      },
      {
        "box": {
          "id": "obj-21",
          "maxclass": "live.menu",
          "patching_rect": [
            96,
            50,
            232,
            20
          ],
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
          "hint": "Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received."
        }
      },
      {
        "box": {
          "id": "obj-22",
          "maxclass": "live.menu",
          "patching_rect": [
            96,
            72,
            232,
            20
          ],
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
          "hint": "None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif."
        }
      },
      {
        "box": {
          "id": "obj-23",
          "maxclass": "live.tab",
          "patching_rect": [
            96,
            94,
            232,
            20
          ],
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
          "hint": "Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature."
        }
      },
      {
        "box": {
          "id": "obj-24",
          "maxclass": "live.tab",
          "patching_rect": [
            96,
            116,
            232,
            20
          ],
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
          "hint": "Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together."
        }
      },
      {
        "box": {
          "id": "obj-25",
          "maxclass": "live.numbox",
          "patching_rect": [
            96,
            138,
            56,
            20
          ],
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
          "hint": "Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting."
        }
      },
      {
        "box": {
          "id": "obj-26",
          "maxclass": "live.numbox",
          "patching_rect": [
            160,
            138,
            56,
            20
          ],
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
          "hint": "Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting."
        }
      },
      {
        "box": {
          "id": "obj-27",
          "maxclass": "comment",
          "patching_rect": [
            80,
            240,
            420,
            20
          ],
          "text": "§ MIDI I/O — fail-open gate → midiselect → engine / midiout",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-28",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            280,
            70,
            22
          ],
          "text": "midiin"
        }
      },
      {
        "box": {
          "id": "obj-29",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            370,
            80,
            22
          ],
          "text": "gate 2 1"
        }
      },
      {
        "box": {
          "id": "obj-30",
          "maxclass": "newobj",
          "patching_rect": [
            240,
            370,
            90,
            22
          ],
          "text": "loadmess 1"
        }
      },
      {
        "box": {
          "id": "obj-31",
          "maxclass": "message",
          "patching_rect": [
            400,
            370,
            40,
            22
          ],
          "text": "2"
        }
      },
      {
        "box": {
          "id": "obj-32",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            460,
            220,
            22
          ],
          "text": "midiselect @ch all @note all"
        }
      },
      {
        "box": {
          "id": "obj-33",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            460,
            90,
            22
          ],
          "text": "midiparse"
        }
      },
      {
        "box": {
          "id": "obj-34",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            550,
            100,
            22
          ],
          "text": "unpack 0 0"
        }
      },
      {
        "box": {
          "id": "obj-35",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            640,
            110,
            22
          ],
          "text": "pack 0 0 1"
        }
      },
      {
        "box": {
          "id": "obj-36",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            730,
            110,
            22
          ],
          "text": "prepend note"
        }
      },
      {
        "box": {
          "id": "obj-37",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            550,
            80,
            22
          ],
          "text": "route 64"
        }
      },
      {
        "box": {
          "id": "obj-38",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            640,
            80,
            22
          ],
          "text": "pack 0 1"
        }
      },
      {
        "box": {
          "id": "obj-39",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            730,
            130,
            22
          ],
          "text": "prepend sustain"
        }
      },
      {
        "box": {
          "id": "obj-40",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            910,
            80,
            22
          ],
          "text": "midiflush"
        }
      },
      {
        "box": {
          "id": "obj-41",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1000,
            70,
            22
          ],
          "text": "midiout"
        }
      },
      {
        "box": {
          "id": "obj-42",
          "maxclass": "comment",
          "patching_rect": [
            720,
            240,
            480,
            20
          ],
          "text": "§ Engine — v8 motif-device.js + event pipe / panic / clear",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-43",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            460,
            200,
            22
          ],
          "text": "v8 motif-device.js",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-44",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            550,
            820,
            22
          ],
          "text": "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui"
        }
      },
      {
        "box": {
          "id": "obj-45",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            640,
            140,
            22
          ],
          "text": "unpack 0 0 0 0."
        }
      },
      {
        "box": {
          "id": "obj-46",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            730,
            130,
            22
          ],
          "text": "pipe 0 0 0 0."
        }
      },
      {
        "box": {
          "id": "obj-47",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            820,
            80,
            22
          ],
          "text": "pack 0 0"
        }
      },
      {
        "box": {
          "id": "obj-48",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            910,
            90,
            22
          ],
          "text": "midiformat"
        }
      },
      {
        "box": {
          "id": "obj-49",
          "maxclass": "newobj",
          "patching_rect": [
            1000,
            640,
            60,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-50",
          "maxclass": "message",
          "patching_rect": [
            1120,
            730,
            60,
            22
          ],
          "text": "clear"
        }
      },
      {
        "box": {
          "id": "obj-51",
          "maxclass": "comment",
          "patching_rect": [
            1600,
            240,
            560,
            20
          ],
          "text": "§ Feedback — motif menu + jweb UI emits (lib/preview as encoded JSON)",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-52",
          "maxclass": "message",
          "patching_rect": [
            1600,
            460,
            60,
            22
          ],
          "text": "clear"
        }
      },
      {
        "box": {
          "id": "obj-53",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            550,
            120,
            22
          ],
          "text": "prepend append"
        }
      },
      {
        "box": {
          "id": "obj-54",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            640,
            140,
            22
          ],
          "text": "prepend setsymbol"
        }
      },
      {
        "box": {
          "id": "obj-55",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            820,
            220,
            22
          ],
          "text": "route lib preview"
        }
      },
      {
        "box": {
          "id": "obj-56",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            910,
            180,
            22
          ],
          "text": "prepend receiveData"
        }
      },
      {
        "box": {
          "id": "obj-57",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            1000,
            150,
            22
          ],
          "text": "send ---lib-data"
        }
      },
      {
        "box": {
          "id": "obj-58",
          "maxclass": "newobj",
          "patching_rect": [
            1840,
            910,
            180,
            22
          ],
          "text": "prepend receiveData"
        }
      },
      {
        "box": {
          "id": "obj-59",
          "maxclass": "newobj",
          "patching_rect": [
            2100,
            1000,
            240,
            22
          ],
          "text": "route preview_ready preview_debug"
        }
      },
      {
        "box": {
          "id": "obj-60",
          "maxclass": "message",
          "patching_rect": [
            2360,
            1000,
            110,
            22
          ],
          "text": "preview_ready"
        }
      },
      {
        "box": {
          "id": "obj-61",
          "maxclass": "newobj",
          "patching_rect": [
            2100,
            1090,
            130,
            22
          ],
          "text": "prepend preview"
        }
      },
      {
        "box": {
          "id": "obj-62",
          "maxclass": "newobj",
          "patching_rect": [
            2260,
            1090,
            150,
            22
          ],
          "text": "prepend web_debug"
        }
      },
      {
        "box": {
          "id": "obj-63",
          "maxclass": "comment",
          "patching_rect": [
            80,
            1160,
            560,
            20
          ],
          "text": "§ Song observers — live.path live_set → live.observer → song_context → v8",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-64",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1200,
            120,
            22
          ],
          "text": "live.thisdevice"
        }
      },
      {
        "box": {
          "id": "obj-65",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1290,
            90,
            22
          ],
          "text": "t b b b"
        }
      },
      {
        "box": {
          "id": "obj-66",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            1290,
            200,
            22
          ],
          "text": "t b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-67",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1380,
            140,
            22
          ],
          "text": "live.path live_set"
        }
      },
      {
        "box": {
          "id": "obj-68",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1470,
            80,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-69",
          "maxclass": "message",
          "patching_rect": [
            80,
            1560,
            90,
            22
          ],
          "text": "initialize"
        }
      },
      {
        "box": {
          "id": "obj-70",
          "maxclass": "newobj",
          "patching_rect": [
            300,
            1560,
            80,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-71",
          "maxclass": "newobj",
          "patching_rect": [
            480,
            1560,
            100,
            22
          ],
          "text": "route Ready"
        }
      },
      {
        "box": {
          "id": "obj-72",
          "maxclass": "newobj",
          "patching_rect": [
            660,
            1560,
            60,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-73",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            1560,
            210,
            22
          ],
          "text": "t b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-74",
          "maxclass": "message",
          "patching_rect": [
            480,
            1380,
            120,
            22
          ],
          "text": "presentation 1"
        }
      },
      {
        "box": {
          "id": "obj-75",
          "maxclass": "newobj",
          "patching_rect": [
            700,
            1380,
            90,
            22
          ],
          "text": "thispatcher"
        }
      },
      {
        "box": {
          "id": "obj-76",
          "maxclass": "newobj",
          "patching_rect": [
            480,
            1290,
            170,
            22
          ],
          "text": "loadmess presentation 1"
        }
      },
      {
        "box": {
          "id": "obj-77",
          "maxclass": "message",
          "patching_rect": [
            80,
            1740,
            210,
            22
          ],
          "text": "property tempo"
        }
      },
      {
        "box": {
          "id": "obj-78",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            1740,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-79",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            1740,
            220,
            22
          ],
          "text": "prepend tempo"
        }
      },
      {
        "box": {
          "id": "obj-80",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            1740,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-81",
          "maxclass": "message",
          "patching_rect": [
            80,
            1830,
            210,
            22
          ],
          "text": "property root_note"
        }
      },
      {
        "box": {
          "id": "obj-82",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            1830,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-83",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            1830,
            220,
            22
          ],
          "text": "prepend root_note"
        }
      },
      {
        "box": {
          "id": "obj-84",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            1830,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-85",
          "maxclass": "message",
          "patching_rect": [
            80,
            1920,
            210,
            22
          ],
          "text": "property scale_mode"
        }
      },
      {
        "box": {
          "id": "obj-86",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            1920,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-87",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            1920,
            220,
            22
          ],
          "text": "prepend scale_mode"
        }
      },
      {
        "box": {
          "id": "obj-88",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            1920,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-89",
          "maxclass": "message",
          "patching_rect": [
            80,
            2010,
            210,
            22
          ],
          "text": "property scale_intervals"
        }
      },
      {
        "box": {
          "id": "obj-90",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2010,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-91",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2010,
            220,
            22
          ],
          "text": "prepend scale_intervals"
        }
      },
      {
        "box": {
          "id": "obj-92",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2010,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-93",
          "maxclass": "message",
          "patching_rect": [
            80,
            2100,
            210,
            22
          ],
          "text": "property scale_name"
        }
      },
      {
        "box": {
          "id": "obj-94",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2100,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-95",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2100,
            220,
            22
          ],
          "text": "prepend scale_name"
        }
      },
      {
        "box": {
          "id": "obj-96",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2100,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-97",
          "maxclass": "message",
          "patching_rect": [
            80,
            2190,
            210,
            22
          ],
          "text": "property signature_numerator"
        }
      },
      {
        "box": {
          "id": "obj-98",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2190,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-99",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2190,
            220,
            22
          ],
          "text": "prepend signature_numerator"
        }
      },
      {
        "box": {
          "id": "obj-100",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2190,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-101",
          "maxclass": "message",
          "patching_rect": [
            80,
            2280,
            210,
            22
          ],
          "text": "property signature_denominator"
        }
      },
      {
        "box": {
          "id": "obj-102",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2280,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-103",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2280,
            220,
            22
          ],
          "text": "prepend signature_denominator"
        }
      },
      {
        "box": {
          "id": "obj-104",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2280,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-105",
          "maxclass": "message",
          "patching_rect": [
            80,
            2370,
            210,
            22
          ],
          "text": "property is_playing"
        }
      },
      {
        "box": {
          "id": "obj-106",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2370,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-107",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2370,
            220,
            22
          ],
          "text": "prepend is_playing"
        }
      },
      {
        "box": {
          "id": "obj-108",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2370,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-109",
          "maxclass": "message",
          "patching_rect": [
            80,
            2460,
            210,
            22
          ],
          "text": "property current_song_time"
        }
      },
      {
        "box": {
          "id": "obj-110",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            2460,
            110,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-111",
          "maxclass": "newobj",
          "patching_rect": [
            540,
            2460,
            220,
            22
          ],
          "text": "prepend current_song_time"
        }
      },
      {
        "box": {
          "id": "obj-112",
          "maxclass": "newobj",
          "patching_rect": [
            840,
            2460,
            170,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-113",
          "maxclass": "comment",
          "patching_rect": [
            80,
            2600,
            520,
            20
          ],
          "text": "§ Host displays — Scale live.menus; active follows Song.scale_mode",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-114",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            2640,
            100,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-115",
          "maxclass": "newobj",
          "patching_rect": [
            240,
            2640,
            140,
            22
          ],
          "text": "prepend setsymbol"
        }
      },
      {
        "box": {
          "id": "obj-116",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            2640,
            70,
            22
          ],
          "text": "sel 0 1"
        }
      },
      {
        "box": {
          "id": "obj-117",
          "maxclass": "newobj",
          "patching_rect": [
            580,
            2640,
            60,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-118",
          "maxclass": "newobj",
          "patching_rect": [
            580,
            2730,
            60,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-119",
          "maxclass": "message",
          "patching_rect": [
            700,
            2640,
            80,
            22
          ],
          "text": "active 0"
        }
      },
      {
        "box": {
          "id": "obj-120",
          "maxclass": "message",
          "patching_rect": [
            840,
            2640,
            80,
            22
          ],
          "text": "active 0"
        }
      },
      {
        "box": {
          "id": "obj-121",
          "maxclass": "message",
          "patching_rect": [
            700,
            2730,
            80,
            22
          ],
          "text": "active 1"
        }
      },
      {
        "box": {
          "id": "obj-122",
          "maxclass": "message",
          "patching_rect": [
            840,
            2730,
            80,
            22
          ],
          "text": "active 1"
        }
      },
      {
        "box": {
          "id": "obj-123",
          "maxclass": "comment",
          "patching_rect": [
            80,
            3160,
            520,
            20
          ],
          "text": "§ Tabs — live.tab → thispatcher hide/show Motif vs Settings boxes",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-124",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            3200,
            70,
            22
          ],
          "text": "sel 0 1"
        }
      },
      {
        "box": {
          "id": "obj-125",
          "maxclass": "message",
          "patching_rect": [
            220,
            3200,
            60,
            22
          ],
          "text": "bang"
        }
      },
      {
        "box": {
          "id": "obj-126",
          "maxclass": "message",
          "patching_rect": [
            220,
            3290,
            60,
            22
          ],
          "text": "bang"
        }
      },
      {
        "box": {
          "id": "obj-127",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            3200,
            350,
            22
          ],
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-128",
          "maxclass": "message",
          "patching_rect": [
            480,
            3200,
            260,
            22
          ],
          "text": "script sendbox trigger-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-129",
          "maxclass": "message",
          "patching_rect": [
            480,
            3270,
            260,
            22
          ],
          "text": "script sendbox trigger-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-130",
          "maxclass": "message",
          "patching_rect": [
            480,
            3340,
            260,
            22
          ],
          "text": "script sendbox quant-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-131",
          "maxclass": "message",
          "patching_rect": [
            480,
            3410,
            260,
            22
          ],
          "text": "script sendbox quant-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-132",
          "maxclass": "message",
          "patching_rect": [
            480,
            3480,
            260,
            22
          ],
          "text": "script sendbox pass-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-133",
          "maxclass": "message",
          "patching_rect": [
            480,
            3550,
            260,
            22
          ],
          "text": "script sendbox pass-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-134",
          "maxclass": "message",
          "patching_rect": [
            480,
            3620,
            260,
            22
          ],
          "text": "script sendbox meter-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-135",
          "maxclass": "message",
          "patching_rect": [
            480,
            3690,
            260,
            22
          ],
          "text": "script sendbox meter-tab hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-136",
          "maxclass": "message",
          "patching_rect": [
            480,
            3760,
            260,
            22
          ],
          "text": "script sendbox retrigger-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-137",
          "maxclass": "message",
          "patching_rect": [
            480,
            3830,
            260,
            22
          ],
          "text": "script sendbox retrigger-tab hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-138",
          "maxclass": "message",
          "patching_rect": [
            480,
            3900,
            260,
            22
          ],
          "text": "script sendbox zone-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-139",
          "maxclass": "message",
          "patching_rect": [
            480,
            3970,
            260,
            22
          ],
          "text": "script sendbox low-number hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-140",
          "maxclass": "message",
          "patching_rect": [
            800,
            3200,
            260,
            22
          ],
          "text": "script sendbox high-number hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-141",
          "maxclass": "message",
          "patching_rect": [
            800,
            3270,
            260,
            22
          ],
          "text": "script sendbox motif-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-142",
          "maxclass": "message",
          "patching_rect": [
            800,
            3340,
            260,
            22
          ],
          "text": "script sendbox tempo-mult-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-143",
          "maxclass": "message",
          "patching_rect": [
            800,
            3410,
            260,
            22
          ],
          "text": "script sendbox tempo-mult-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-144",
          "maxclass": "message",
          "patching_rect": [
            800,
            3480,
            260,
            22
          ],
          "text": "script sendbox info-button hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-145",
          "maxclass": "message",
          "patching_rect": [
            800,
            3550,
            260,
            22
          ],
          "text": "script sendbox panic-button hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-146",
          "maxclass": "message",
          "patching_rect": [
            800,
            3620,
            260,
            22
          ],
          "text": "script sendbox ui-preview-panel hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-147",
          "maxclass": "message",
          "patching_rect": [
            800,
            3690,
            260,
            22
          ],
          "text": "script sendbox motif-preview hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-148",
          "maxclass": "message",
          "patching_rect": [
            800,
            3760,
            260,
            22
          ],
          "text": "script sendbox pitch-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-149",
          "maxclass": "message",
          "patching_rect": [
            800,
            3830,
            260,
            22
          ],
          "text": "script sendbox pitch-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-150",
          "maxclass": "message",
          "patching_rect": [
            800,
            3900,
            260,
            22
          ],
          "text": "script sendbox scale-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-151",
          "maxclass": "message",
          "patching_rect": [
            800,
            3970,
            260,
            22
          ],
          "text": "script sendbox root-display hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-152",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3200,
            260,
            22
          ],
          "text": "script sendbox scale-name-display hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-153",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            4460,
            350,
            22
          ],
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-154",
          "maxclass": "message",
          "patching_rect": [
            480,
            4460,
            260,
            22
          ],
          "text": "script sendbox motif-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-155",
          "maxclass": "message",
          "patching_rect": [
            480,
            4530,
            260,
            22
          ],
          "text": "script sendbox tempo-mult-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-156",
          "maxclass": "message",
          "patching_rect": [
            480,
            4600,
            260,
            22
          ],
          "text": "script sendbox tempo-mult-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-157",
          "maxclass": "message",
          "patching_rect": [
            480,
            4670,
            260,
            22
          ],
          "text": "script sendbox info-button hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-158",
          "maxclass": "message",
          "patching_rect": [
            480,
            4740,
            260,
            22
          ],
          "text": "script sendbox panic-button hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-159",
          "maxclass": "message",
          "patching_rect": [
            480,
            4810,
            260,
            22
          ],
          "text": "script sendbox ui-preview-panel hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-160",
          "maxclass": "message",
          "patching_rect": [
            480,
            4880,
            260,
            22
          ],
          "text": "script sendbox motif-preview hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-161",
          "maxclass": "message",
          "patching_rect": [
            480,
            4950,
            260,
            22
          ],
          "text": "script sendbox pitch-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-162",
          "maxclass": "message",
          "patching_rect": [
            480,
            5020,
            260,
            22
          ],
          "text": "script sendbox pitch-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-163",
          "maxclass": "message",
          "patching_rect": [
            480,
            5090,
            260,
            22
          ],
          "text": "script sendbox scale-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-164",
          "maxclass": "message",
          "patching_rect": [
            480,
            5160,
            260,
            22
          ],
          "text": "script sendbox root-display hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-165",
          "maxclass": "message",
          "patching_rect": [
            480,
            5230,
            260,
            22
          ],
          "text": "script sendbox scale-name-display hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-166",
          "maxclass": "message",
          "patching_rect": [
            800,
            4460,
            260,
            22
          ],
          "text": "script sendbox trigger-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-167",
          "maxclass": "message",
          "patching_rect": [
            800,
            4530,
            260,
            22
          ],
          "text": "script sendbox trigger-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-168",
          "maxclass": "message",
          "patching_rect": [
            800,
            4600,
            260,
            22
          ],
          "text": "script sendbox quant-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-169",
          "maxclass": "message",
          "patching_rect": [
            800,
            4670,
            260,
            22
          ],
          "text": "script sendbox quant-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-170",
          "maxclass": "message",
          "patching_rect": [
            800,
            4740,
            260,
            22
          ],
          "text": "script sendbox pass-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-171",
          "maxclass": "message",
          "patching_rect": [
            800,
            4810,
            260,
            22
          ],
          "text": "script sendbox pass-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-172",
          "maxclass": "message",
          "patching_rect": [
            800,
            4880,
            260,
            22
          ],
          "text": "script sendbox meter-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-173",
          "maxclass": "message",
          "patching_rect": [
            800,
            4950,
            260,
            22
          ],
          "text": "script sendbox meter-tab hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-174",
          "maxclass": "message",
          "patching_rect": [
            800,
            5020,
            260,
            22
          ],
          "text": "script sendbox retrigger-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-175",
          "maxclass": "message",
          "patching_rect": [
            800,
            5090,
            260,
            22
          ],
          "text": "script sendbox retrigger-tab hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-176",
          "maxclass": "message",
          "patching_rect": [
            800,
            5160,
            260,
            22
          ],
          "text": "script sendbox zone-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-177",
          "maxclass": "message",
          "patching_rect": [
            800,
            5230,
            260,
            22
          ],
          "text": "script sendbox low-number hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-178",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4460,
            260,
            22
          ],
          "text": "script sendbox high-number hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-179",
          "maxclass": "comment",
          "patching_rect": [
            2000,
            3160,
            480,
            20
          ],
          "text": "§ Library/Authoring — pcontrol float (search, clip import, note edit)",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-199",
          "maxclass": "newobj",
          "patching_rect": [
            2000,
            3650,
            140,
            22
          ],
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
              640,
              460
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
                  "id": "obj-180",
                  "maxclass": "jweb",
                  "patching_rect": [
                    0,
                    0,
                    640,
                    460
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    0,
                    0,
                    640,
                    460
                  ],
                  "rendermode": 0,
                  "autosize": 1,
                  "varname": "jweb-library"
                }
              },
              {
                "box": {
                  "id": "obj-181",
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
                  "id": "obj-182",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    500,
                    90,
                    22
                  ],
                  "text": "thispatcher"
                }
              },
              {
                "box": {
                  "id": "obj-183",
                  "maxclass": "newobj",
                  "patching_rect": [
                    140,
                    500,
                    160,
                    22
                  ],
                  "text": "loadmess presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-184",
                  "maxclass": "newobj",
                  "patching_rect": [
                    320,
                    500,
                    180,
                    22
                  ],
                  "text": "loadmess window size 640 460"
                }
              },
              {
                "box": {
                  "id": "obj-185",
                  "maxclass": "newobj",
                  "patching_rect": [
                    520,
                    500,
                    210,
                    22
                  ],
                  "text": "loadmess title \"Motif Library\""
                }
              },
              {
                "box": {
                  "id": "obj-186",
                  "maxclass": "newobj",
                  "patching_rect": [
                    760,
                    500,
                    210,
                    22
                  ],
                  "text": "loadmess readfile library.html"
                }
              },
              {
                "box": {
                  "id": "obj-187",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    536,
                    170,
                    22
                  ],
                  "text": "receive ---lib-data"
                }
              },
              {
                "box": {
                  "id": "obj-188",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    608,
                    470,
                    22
                  ],
                  "text": "route choose_library library_ready web_debug lib_action url title"
                }
              },
              {
                "box": {
                  "id": "obj-189",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    644,
                    120,
                    22
                  ],
                  "text": "opendialog fold"
                }
              },
              {
                "box": {
                  "id": "obj-190",
                  "maxclass": "newobj",
                  "patching_rect": [
                    180,
                    644,
                    160,
                    22
                  ],
                  "text": "send ---library_path"
                }
              },
              {
                "box": {
                  "id": "obj-191",
                  "maxclass": "message",
                  "patching_rect": [
                    320,
                    644,
                    110,
                    22
                  ],
                  "text": "library_ready"
                }
              },
              {
                "box": {
                  "id": "obj-192",
                  "maxclass": "newobj",
                  "patching_rect": [
                    450,
                    608,
                    160,
                    22
                  ],
                  "text": "prepend lib_action"
                }
              },
              {
                "box": {
                  "id": "obj-193",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    608,
                    170,
                    22
                  ],
                  "text": "send ---motif_author"
                }
              },
              {
                "box": {
                  "id": "obj-194",
                  "maxclass": "newobj",
                  "patching_rect": [
                    450,
                    644,
                    190,
                    22
                  ],
                  "text": "send ---motif_web_debug"
                }
              },
              {
                "box": {
                  "id": "obj-195",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    680,
                    150,
                    22
                  ],
                  "text": "prepend library-url"
                }
              },
              {
                "box": {
                  "id": "obj-196",
                  "maxclass": "newobj",
                  "patching_rect": [
                    200,
                    680,
                    160,
                    22
                  ],
                  "text": "prepend library-title"
                }
              },
              {
                "box": {
                  "id": "obj-197",
                  "maxclass": "newobj",
                  "patching_rect": [
                    400,
                    680,
                    140,
                    22
                  ],
                  "text": "print Motif-jweb"
                }
              },
              {
                "box": {
                  "id": "obj-198",
                  "maxclass": "newobj",
                  "patching_rect": [
                    560,
                    680,
                    190,
                    22
                  ],
                  "text": "prepend library-unhandled"
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "obj-183",
                    0
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
                    "obj-184",
                    0
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
                    "obj-185",
                    0
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
                    "obj-181",
                    0
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
                    "obj-186",
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
                    "obj-187",
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
                    "obj-190",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-188",
                    1
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
                    "obj-193",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-188",
                    2
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
                    "obj-188",
                    3
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
                    "obj-188",
                    4
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
                    "obj-188",
                    5
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
                    "obj-195",
                    0
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
                    "obj-196",
                    0
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
                    "obj-188",
                    6
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
                    "obj-197",
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
                    "obj-193",
                    0
                  ]
                }
              }
            ],
            "dependency_cache": [],
            "autosave": 0
          }
        }
      },
      {
        "box": {
          "id": "obj-200",
          "maxclass": "newobj",
          "patching_rect": [
            2000,
            3470,
            80,
            22
          ],
          "text": "pcontrol"
        }
      },
      {
        "box": {
          "id": "obj-201",
          "maxclass": "newobj",
          "patching_rect": [
            2000,
            3200,
            110,
            22
          ],
          "text": "t b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-202",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3200,
            230,
            22
          ],
          "text": "window flags float grow close zoom"
        }
      },
      {
        "box": {
          "id": "obj-203",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3290,
            150,
            22
          ],
          "text": "window size 640 460"
        }
      },
      {
        "box": {
          "id": "obj-204",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3380,
            150,
            22
          ],
          "text": "window size 640 460"
        }
      },
      {
        "box": {
          "id": "obj-205",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3470,
            110,
            22
          ],
          "text": "window exec"
        }
      },
      {
        "box": {
          "id": "obj-206",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3560,
            60,
            22
          ],
          "text": "open"
        }
      },
      {
        "box": {
          "id": "obj-207",
          "maxclass": "newobj",
          "patching_rect": [
            2400,
            3380,
            80,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-208",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3200,
            180,
            22
          ],
          "text": "receive ---library_path"
        }
      },
      {
        "box": {
          "id": "obj-209",
          "maxclass": "newobj",
          "patching_rect": [
            2640,
            3200,
            480,
            22
          ],
          "text": "pattr motif_library_path @autorestore 1 @thru 2 @parameter_enable 1 @parameter_mappable 0"
        }
      },
      {
        "box": {
          "id": "obj-210",
          "maxclass": "newobj",
          "patching_rect": [
            3160,
            3200,
            160,
            22
          ],
          "text": "prepend library_path"
        }
      },
      {
        "box": {
          "id": "obj-211",
          "maxclass": "newobj",
          "patching_rect": [
            2640,
            3290,
            80,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-212",
          "maxclass": "message",
          "patching_rect": [
            2760,
            3290,
            60,
            22
          ],
          "text": "bang"
        }
      },
      {
        "box": {
          "id": "obj-213",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3290,
            180,
            22
          ],
          "text": "receive ---motif_author"
        }
      },
      {
        "box": {
          "id": "obj-214",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3380,
            210,
            22
          ],
          "text": "receive ---motif_web_debug"
        }
      },
      {
        "box": {
          "id": "obj-215",
          "maxclass": "newobj",
          "patching_rect": [
            2680,
            3380,
            160,
            22
          ],
          "text": "prepend web_debug"
        }
      },
      {
        "box": {
          "id": "obj-216",
          "maxclass": "comment",
          "patching_rect": [
            80,
            4760,
            480,
            20
          ],
          "text": "§ Controls → v8 — menus/tabs/numbers + loadmess defaults",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-217",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            4800,
            110,
            22
          ],
          "text": "prepend motif"
        }
      },
      {
        "box": {
          "id": "obj-218",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            4800,
            150,
            22
          ],
          "text": "prepend pitch_mode"
        }
      },
      {
        "box": {
          "id": "obj-219",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            4800,
            180,
            22
          ],
          "text": "prepend tempo_multiplier"
        }
      },
      {
        "box": {
          "id": "obj-220",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            4800,
            160,
            22
          ],
          "text": "prepend trigger_mode"
        }
      },
      {
        "box": {
          "id": "obj-221",
          "maxclass": "newobj",
          "patching_rect": [
            1060,
            4800,
            200,
            22
          ],
          "text": "prepend launch_quantization"
        }
      },
      {
        "box": {
          "id": "obj-222",
          "maxclass": "newobj",
          "patching_rect": [
            1360,
            4800,
            170,
            22
          ],
          "text": "prepend pass_through"
        }
      },
      {
        "box": {
          "id": "obj-223",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            4890,
            150,
            22
          ],
          "text": "prepend meter_mode"
        }
      },
      {
        "box": {
          "id": "obj-224",
          "maxclass": "newobj",
          "patching_rect": [
            320,
            4890,
            140,
            22
          ],
          "text": "prepend retrigger"
        }
      },
      {
        "box": {
          "id": "obj-225",
          "maxclass": "newobj",
          "patching_rect": [
            560,
            4890,
            150,
            22
          ],
          "text": "prepend trigger_low"
        }
      },
      {
        "box": {
          "id": "obj-226",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            4890,
            150,
            22
          ],
          "text": "prepend trigger_high"
        }
      },
      {
        "box": {
          "id": "obj-227",
          "maxclass": "message",
          "patching_rect": [
            1060,
            4890,
            60,
            22
          ],
          "text": "panic"
        }
      },
      {
        "box": {
          "id": "obj-228",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            5070,
            90,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-229",
          "maxclass": "newobj",
          "patching_rect": [
            240,
            5070,
            90,
            22
          ],
          "text": "loadmess 1"
        }
      },
      {
        "box": {
          "id": "obj-230",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            5070,
            90,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-231",
          "maxclass": "newobj",
          "patching_rect": [
            560,
            5070,
            90,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-232",
          "maxclass": "newobj",
          "patching_rect": [
            720,
            5070,
            90,
            22
          ],
          "text": "loadmess 1"
        }
      },
      {
        "box": {
          "id": "obj-233",
          "maxclass": "newobj",
          "patching_rect": [
            880,
            5070,
            90,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-234",
          "maxclass": "newobj",
          "patching_rect": [
            1040,
            5070,
            90,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-235",
          "maxclass": "newobj",
          "patching_rect": [
            1200,
            5070,
            90,
            22
          ],
          "text": "loadmess 36"
        }
      },
      {
        "box": {
          "id": "obj-236",
          "maxclass": "newobj",
          "patching_rect": [
            1360,
            5070,
            90,
            22
          ],
          "text": "loadmess 84"
        }
      },
      {
        "box": {
          "id": "obj-237",
          "maxclass": "newobj",
          "patching_rect": [
            1520,
            5070,
            90,
            22
          ],
          "text": "loadmess 0"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-66",
            0
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
            "obj-67",
            0
          ],
          "destination": [
            "obj-78",
            1
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
            "obj-80",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-80",
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
            "obj-66",
            1
          ],
          "destination": [
            "obj-81",
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
            "obj-67",
            0
          ],
          "destination": [
            "obj-82",
            1
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
            "obj-83",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-83",
            0
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
            "obj-84",
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
            "obj-66",
            2
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
            "obj-67",
            0
          ],
          "destination": [
            "obj-86",
            1
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
            "obj-87",
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
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            3
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
            "obj-67",
            0
          ],
          "destination": [
            "obj-90",
            1
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
            "obj-91",
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
            "obj-92",
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
            "obj-66",
            4
          ],
          "destination": [
            "obj-93",
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
            "obj-94",
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
            "obj-94",
            1
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
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            5
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
            "obj-98",
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
            "obj-98",
            1
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
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            6
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
            "obj-102",
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
            "obj-102",
            1
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
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            7
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
            "obj-106",
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
            "obj-106",
            1
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
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            8
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
            "obj-110",
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
            "obj-110",
            1
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
            "obj-70",
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
            "obj-12",
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
            "obj-115",
            0
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
            "obj-13",
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
            "obj-116",
            1
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
            "obj-117",
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
            "obj-117",
            1
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
            "obj-119",
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
            "obj-120",
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
            "obj-118",
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
            "obj-118",
            1
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
            "obj-121",
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
            "obj-122",
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
            "obj-64",
            0
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
            2
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
            "obj-65",
            1
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
            "obj-65",
            0
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-70",
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
            "obj-44",
            3
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
            "obj-72",
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
            "obj-31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-31",
            0
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
            "obj-78",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-73",
            1
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
            "obj-73",
            2
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
            "obj-73",
            3
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
            "obj-73",
            4
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
            "obj-73",
            5
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
            "obj-73",
            6
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
            "obj-73",
            7
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
            "obj-73",
            8
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
            "obj-76",
            0
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
            "obj-74",
            0
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
            "obj-1",
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
            "obj-124",
            1
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
            "obj-125",
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            1
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            2
          ],
          "destination": [
            "obj-130",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-130",
            0
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
            "obj-127",
            3
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            4
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            5
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
            "obj-133",
            0
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
            "obj-127",
            6
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
            "obj-134",
            0
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
            "obj-127",
            7
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
            0
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
            "obj-127",
            8
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            9
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            10
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
            "obj-138",
            0
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
            "obj-127",
            11
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
            "obj-139",
            0
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
            "obj-127",
            12
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            13
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            14
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            15
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            16
          ],
          "destination": [
            "obj-144",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-144",
            0
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
            "obj-127",
            17
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            18
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
            "obj-146",
            0
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
            "obj-127",
            19
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
            "obj-147",
            0
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
            "obj-127",
            20
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            21
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            22
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            23
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-127",
            24
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
            "obj-75",
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            1
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            2
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            3
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            4
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            5
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            6
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            7
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            8
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            9
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            10
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            11
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            12
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            13
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            14
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            15
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            16
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            17
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            18
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            19
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            20
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            21
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            22
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            23
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
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-153",
            24
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
            "obj-75",
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
            "obj-201",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-201",
            4
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
            "obj-201",
            3
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
            "obj-201",
            2
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
            "obj-201",
            1
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
            "obj-201",
            0
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
            "obj-204",
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
            "obj-199",
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
            "obj-199",
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
            "obj-199",
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
            "obj-199",
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
            "obj-199",
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
            "obj-209",
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
            "obj-210",
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-64",
            0
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
            "obj-212",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-212",
            0
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
            "obj-213",
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
            "obj-214",
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
            "obj-215",
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
            "obj-28",
            0
          ],
          "destination": [
            "obj-29",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-30",
            0
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
            "obj-29",
            0
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
            "obj-29",
            1
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
            "obj-29",
            1
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
            "obj-32",
            7
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
            "obj-32",
            0
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
            "obj-32",
            6
          ],
          "destination": [
            "obj-35",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
            1
          ],
          "destination": [
            "obj-35",
            1
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
            "obj-35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            0
          ],
          "destination": [
            "obj-36",
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-33",
            6
          ],
          "destination": [
            "obj-38",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-33",
            2
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
            "obj-38",
            0
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
            "obj-45",
            1
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
            "obj-45",
            2
          ],
          "destination": [
            "obj-46",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-45",
            3
          ],
          "destination": [
            "obj-46",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-46",
            2
          ],
          "destination": [
            "obj-48",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-46",
            1
          ],
          "destination": [
            "obj-47",
            1
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
            "obj-40",
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
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-44",
            1
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
            "obj-49",
            1
          ],
          "destination": [
            "obj-50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-49",
            0
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
            "obj-44",
            2
          ],
          "destination": [
            "obj-50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-50",
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
            "obj-44",
            6
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
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-44",
            7
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
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-44",
            8
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
            "obj-54",
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
            "obj-44",
            10
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
            "obj-57",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-55",
            1
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
            0
          ],
          "destination": [
            "obj-8",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-8",
            0
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
            "obj-59",
            0
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
            "obj-60",
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
            "obj-59",
            1
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
            "obj-43",
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-10",
            1
          ],
          "destination": [
            "obj-218",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-218",
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
            "obj-4",
            1
          ],
          "destination": [
            "obj-219",
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-20",
            1
          ],
          "destination": [
            "obj-220",
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-21",
            1
          ],
          "destination": [
            "obj-221",
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            1
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-23",
            1
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-24",
            1
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
            "obj-224",
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
            "obj-25",
            0
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
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            0
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
            "obj-226",
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
            "obj-6",
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
            "obj-227",
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
            "obj-228",
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
            "obj-229",
            0
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
            "obj-230",
            0
          ],
          "destination": [
            "obj-20",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-231",
            0
          ],
          "destination": [
            "obj-21",
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
            "obj-22",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-233",
            0
          ],
          "destination": [
            "obj-23",
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
            "obj-24",
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
            "obj-25",
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
            "obj-26",
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
            "obj-1",
            0
          ]
        }
      }
    ],
    "dependency_cache": [
      {
        "name": "motif-device.js",
        "bootpath": ".",
        "patcherrelativepath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "motif-preview.js",
        "bootpath": ".",
        "patcherrelativepath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "library.html",
        "bootpath": ".",
        "patcherrelativepath": ".",
        "type": "TEXT",
        "implicit": 1
      }
    ],
    "autosave": 0
  }
}
