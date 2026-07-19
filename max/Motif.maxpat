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
          "maxclass": "multislider",
          "patching_rect": [
            12,
            32,
            456,
            92
          ],
          "settype": 0,
          "setstyle": 1,
          "setminmax": [
            0,
            12
          ],
          "size": 8,
          "thickness": 6,
          "spacing": 2,
          "drawpeaks": 0,
          "contdata": 2,
          "listresize": 1,
          "bgcolor": [
            0.08,
            0.08,
            0.09,
            1
          ],
          "slidercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.2,
            0.2,
            0.22,
            1
          ],
          "ignoreclick": 1,
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
          "maxclass": "comment",
          "patching_rect": [
            8,
            130,
            464,
            14
          ],
          "text": "C3  ·  A♯2  ·  D♯3  ·  D3  ·  C♯3  ·  C3",
          "fontname": "Ableton Sans",
          "fontsize": 11,
          "fontface": 1,
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
            130,
            464,
            14
          ],
          "varname": "preview-notes-display",
          "ignoreclick": 1,
          "hidden": 0,
          "annotation_name": "Preview Notes",
          "annotation": "The exact MIDI note names that the current preview will play.",
          "hint": "The exact MIDI note names that the current preview will play."
        }
      },
      {
        "box": {
          "id": "obj-10",
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
          "id": "obj-11",
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
          "id": "obj-12",
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
          "id": "obj-13",
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
          "id": "obj-14",
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
          "id": "obj-15",
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
          "id": "obj-16",
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
          "id": "obj-17",
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
          "id": "obj-18",
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
          "id": "obj-19",
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
          "id": "obj-20",
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
          "id": "obj-21",
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
          "id": "obj-22",
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
          "id": "obj-23",
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
          "id": "obj-24",
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
          "id": "obj-25",
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
          "id": "obj-26",
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
          "id": "obj-27",
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
          "id": "obj-28",
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
          "id": "obj-29",
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
          "id": "obj-30",
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
          "id": "obj-31",
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
          "id": "obj-32",
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
          "id": "obj-33",
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
          "id": "obj-34",
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
          "id": "obj-35",
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
          "id": "obj-36",
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
          "id": "obj-37",
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
          "id": "obj-38",
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
          "id": "obj-39",
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
          "id": "obj-40",
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
          "id": "obj-41",
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
          "id": "obj-42",
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
          "id": "obj-43",
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
          "id": "obj-44",
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
          "id": "obj-45",
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
          "id": "obj-46",
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
          "id": "obj-47",
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
          "id": "obj-48",
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
          "id": "obj-49",
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
          "id": "obj-50",
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
          "id": "obj-51",
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
          "id": "obj-52",
          "maxclass": "comment",
          "patching_rect": [
            1600,
            240,
            560,
            20
          ],
          "text": "§ Feedback — motif menu + preview / library UI emits (status stays in Max window)",
          "fontname": "Ableton Sans",
          "fontsize": 12,
          "fontface": 1,
          "presentation": 0
        }
      },
      {
        "box": {
          "id": "obj-53",
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
          "id": "obj-54",
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
          "id": "obj-55",
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
          "id": "obj-56",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            820,
            1200,
            22
          ],
          "text": "route preview-size preview-pitches preview-range preview-notes preview-root motif-title motif-description motif-stats motif-tags browser-reset browser-item browser-selected note-row-vis note-row-data"
        }
      },
      {
        "box": {
          "id": "obj-57",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            910,
            100,
            22
          ],
          "text": "prepend size"
        }
      },
      {
        "box": {
          "id": "obj-58",
          "maxclass": "newobj",
          "patching_rect": [
            1760,
            910,
            120,
            22
          ],
          "text": "prepend setlist"
        }
      },
      {
        "box": {
          "id": "obj-59",
          "maxclass": "newobj",
          "patching_rect": [
            1940,
            910,
            120,
            22
          ],
          "text": "prepend setmax"
        }
      },
      {
        "box": {
          "id": "obj-60",
          "maxclass": "newobj",
          "patching_rect": [
            2120,
            910,
            100,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-61",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            1000,
            160,
            22
          ],
          "text": "send ---motif-title"
        }
      },
      {
        "box": {
          "id": "obj-62",
          "maxclass": "newobj",
          "patching_rect": [
            1840,
            1000,
            190,
            22
          ],
          "text": "send ---motif-description"
        }
      },
      {
        "box": {
          "id": "obj-63",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            1090,
            160,
            22
          ],
          "text": "send ---motif-stats"
        }
      },
      {
        "box": {
          "id": "obj-64",
          "maxclass": "newobj",
          "patching_rect": [
            1840,
            1090,
            160,
            22
          ],
          "text": "send ---motif-tags"
        }
      },
      {
        "box": {
          "id": "obj-65",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            1180,
            170,
            22
          ],
          "text": "send ---browser-clear"
        }
      },
      {
        "box": {
          "id": "obj-66",
          "maxclass": "newobj",
          "patching_rect": [
            1840,
            1180,
            180,
            22
          ],
          "text": "send ---browser-append"
        }
      },
      {
        "box": {
          "id": "obj-67",
          "maxclass": "newobj",
          "patching_rect": [
            2100,
            1180,
            180,
            22
          ],
          "text": "send ---browser-select"
        }
      },
      {
        "box": {
          "id": "obj-68",
          "maxclass": "newobj",
          "patching_rect": [
            1600,
            1270,
            170,
            22
          ],
          "text": "send ---note-row-vis"
        }
      },
      {
        "box": {
          "id": "obj-69",
          "maxclass": "newobj",
          "patching_rect": [
            1840,
            1270,
            180,
            22
          ],
          "text": "send ---note-row-data"
        }
      },
      {
        "box": {
          "id": "obj-70",
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
          "id": "obj-71",
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
          "id": "obj-72",
          "maxclass": "newobj",
          "patching_rect": [
            80,
            1290,
            80,
            22
          ],
          "text": "t b b b"
        }
      },
      {
        "box": {
          "id": "obj-73",
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
          "id": "obj-74",
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
          "id": "obj-75",
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
          "id": "obj-76",
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
          "id": "obj-77",
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
          "id": "obj-78",
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
          "id": "obj-79",
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
          "id": "obj-80",
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
          "id": "obj-81",
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
          "id": "obj-82",
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
          "id": "obj-83",
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
          "id": "obj-84",
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
          "id": "obj-85",
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
          "id": "obj-86",
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
          "id": "obj-87",
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
          "id": "obj-88",
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
          "id": "obj-89",
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
          "id": "obj-90",
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
          "id": "obj-91",
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
          "id": "obj-92",
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
          "id": "obj-93",
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
          "id": "obj-94",
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
          "id": "obj-95",
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
          "id": "obj-96",
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
          "id": "obj-97",
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
          "id": "obj-98",
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
          "id": "obj-99",
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
          "id": "obj-100",
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
          "id": "obj-101",
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
          "id": "obj-102",
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
          "id": "obj-103",
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
          "id": "obj-104",
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
          "id": "obj-105",
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
          "id": "obj-106",
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
          "id": "obj-107",
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
          "id": "obj-108",
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
          "id": "obj-109",
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
          "id": "obj-110",
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
          "id": "obj-111",
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
          "id": "obj-112",
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
          "id": "obj-113",
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
          "id": "obj-114",
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
          "id": "obj-115",
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
          "id": "obj-116",
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
          "id": "obj-117",
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
          "id": "obj-118",
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
          "id": "obj-119",
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
          "id": "obj-120",
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
          "id": "obj-121",
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
          "id": "obj-122",
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
          "id": "obj-123",
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
          "id": "obj-124",
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
          "id": "obj-125",
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
          "id": "obj-126",
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
          "id": "obj-127",
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
          "id": "obj-128",
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
          "id": "obj-129",
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
          "id": "obj-130",
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
          "id": "obj-131",
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
          "id": "obj-132",
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
          "id": "obj-133",
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
          "id": "obj-134",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            3200,
            364,
            22
          ],
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-135",
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
          "id": "obj-136",
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
          "id": "obj-137",
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
          "id": "obj-138",
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
          "id": "obj-139",
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
          "id": "obj-140",
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
          "id": "obj-141",
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
          "id": "obj-142",
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
          "id": "obj-143",
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
          "id": "obj-144",
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
          "id": "obj-145",
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
          "id": "obj-146",
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
          "id": "obj-147",
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
          "id": "obj-148",
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
          "id": "obj-149",
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
          "id": "obj-150",
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
          "id": "obj-151",
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
          "id": "obj-152",
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
          "id": "obj-153",
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
          "id": "obj-154",
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
          "id": "obj-155",
          "maxclass": "message",
          "patching_rect": [
            800,
            3760,
            260,
            22
          ],
          "text": "script sendbox preview-notes-display hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-156",
          "maxclass": "message",
          "patching_rect": [
            800,
            3830,
            260,
            22
          ],
          "text": "script sendbox pitch-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-157",
          "maxclass": "message",
          "patching_rect": [
            800,
            3900,
            260,
            22
          ],
          "text": "script sendbox pitch-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-158",
          "maxclass": "message",
          "patching_rect": [
            800,
            3970,
            260,
            22
          ],
          "text": "script sendbox scale-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-159",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3200,
            260,
            22
          ],
          "text": "script sendbox root-display hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-160",
          "maxclass": "message",
          "patching_rect": [
            1120,
            3270,
            260,
            22
          ],
          "text": "script sendbox scale-name-display hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-161",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            4460,
            364,
            22
          ],
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-162",
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
          "id": "obj-163",
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
          "id": "obj-164",
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
          "id": "obj-165",
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
          "id": "obj-166",
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
          "id": "obj-167",
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
          "id": "obj-168",
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
          "id": "obj-169",
          "maxclass": "message",
          "patching_rect": [
            480,
            4950,
            260,
            22
          ],
          "text": "script sendbox preview-notes-display hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-170",
          "maxclass": "message",
          "patching_rect": [
            480,
            5020,
            260,
            22
          ],
          "text": "script sendbox pitch-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-171",
          "maxclass": "message",
          "patching_rect": [
            480,
            5090,
            260,
            22
          ],
          "text": "script sendbox pitch-menu hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-172",
          "maxclass": "message",
          "patching_rect": [
            480,
            5160,
            260,
            22
          ],
          "text": "script sendbox scale-label hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-173",
          "maxclass": "message",
          "patching_rect": [
            480,
            5230,
            260,
            22
          ],
          "text": "script sendbox root-display hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-174",
          "maxclass": "message",
          "patching_rect": [
            800,
            4460,
            260,
            22
          ],
          "text": "script sendbox scale-name-display hidden 1"
        }
      },
      {
        "box": {
          "id": "obj-175",
          "maxclass": "message",
          "patching_rect": [
            800,
            4530,
            260,
            22
          ],
          "text": "script sendbox trigger-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-176",
          "maxclass": "message",
          "patching_rect": [
            800,
            4600,
            260,
            22
          ],
          "text": "script sendbox trigger-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-177",
          "maxclass": "message",
          "patching_rect": [
            800,
            4670,
            260,
            22
          ],
          "text": "script sendbox quant-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-178",
          "maxclass": "message",
          "patching_rect": [
            800,
            4740,
            260,
            22
          ],
          "text": "script sendbox quant-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-179",
          "maxclass": "message",
          "patching_rect": [
            800,
            4810,
            260,
            22
          ],
          "text": "script sendbox pass-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-180",
          "maxclass": "message",
          "patching_rect": [
            800,
            4880,
            260,
            22
          ],
          "text": "script sendbox pass-menu hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-181",
          "maxclass": "message",
          "patching_rect": [
            800,
            4950,
            260,
            22
          ],
          "text": "script sendbox meter-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-182",
          "maxclass": "message",
          "patching_rect": [
            800,
            5020,
            260,
            22
          ],
          "text": "script sendbox meter-tab hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-183",
          "maxclass": "message",
          "patching_rect": [
            800,
            5090,
            260,
            22
          ],
          "text": "script sendbox retrigger-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-184",
          "maxclass": "message",
          "patching_rect": [
            800,
            5160,
            260,
            22
          ],
          "text": "script sendbox retrigger-tab hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-185",
          "maxclass": "message",
          "patching_rect": [
            800,
            5230,
            260,
            22
          ],
          "text": "script sendbox zone-label hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-186",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4460,
            260,
            22
          ],
          "text": "script sendbox low-number hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-187",
          "maxclass": "message",
          "patching_rect": [
            1120,
            4530,
            260,
            22
          ],
          "text": "script sendbox high-number hidden 0"
        }
      },
      {
        "box": {
          "id": "obj-188",
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
          "id": "obj-665",
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
                  "id": "obj-189",
                  "maxclass": "inlet",
                  "patching_rect": [
                    20,
                    20,
                    40,
                    20
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-190",
                  "maxclass": "panel",
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
                  "background": 1,
                  "border": 0,
                  "bgcolor": [
                    0.12,
                    0.12,
                    0.13,
                    1
                  ],
                  "rounded": 0,
                  "varname": "lib-bg"
                }
              },
              {
                "box": {
                  "id": "obj-191",
                  "maxclass": "comment",
                  "patching_rect": [
                    12,
                    10,
                    60,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    12,
                    10,
                    60,
                    14
                  ],
                  "text": "Search",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-192",
                  "maxclass": "textedit",
                  "patching_rect": [
                    12,
                    28,
                    148,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    12,
                    28,
                    148,
                    22
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
                  "keymode": 1,
                  "outputmode": 1,
                  "varname": "motif-search",
                  "annotation_name": "Search Motifs",
                  "annotation": "Filter the motif list by name, id, tags, or description. Use All to reset.",
                  "hint": "Filter the motif list by name, id, tags, or description. Use All to reset."
                }
              },
              {
                "box": {
                  "id": "obj-193",
                  "maxclass": "live.text",
                  "patching_rect": [
                    164,
                    28,
                    44,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    164,
                    28,
                    44,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "All",
                  "texton": "All",
                  "varname": "clear-search-button",
                  "annotation_name": "Show All Motifs",
                  "annotation": "Clear the search filter and show every motif in the browser.",
                  "hint": "Clear the search filter and show every motif in the browser."
                }
              },
              {
                "box": {
                  "id": "obj-194",
                  "maxclass": "umenu",
                  "patching_rect": [
                    12,
                    56,
                    196,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    12,
                    56,
                    196,
                    22
                  ],
                  "items": "",
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
                  "varname": "browser-list",
                  "annotation_name": "Motif Browser",
                  "annotation": "Select a motif from the filtered library list.",
                  "hint": "Select a motif from the filtered library list."
                }
              },
              {
                "box": {
                  "id": "obj-195",
                  "maxclass": "live.text",
                  "patching_rect": [
                    12,
                    90,
                    96,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    12,
                    90,
                    96,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "Import Clip",
                  "texton": "Import Clip",
                  "varname": "import-clip-button",
                  "annotation_name": "Import Clip",
                  "annotation": "Import notes from the selected Live MIDI clip (Detail View) into a new motif.",
                  "hint": "Import notes from the selected Live MIDI clip (Detail View) into a new motif."
                }
              },
              {
                "box": {
                  "id": "obj-196",
                  "maxclass": "live.text",
                  "patching_rect": [
                    116,
                    90,
                    92,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    116,
                    90,
                    92,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "Save",
                  "texton": "Save",
                  "varname": "save-motif-button",
                  "annotation_name": "Save Motif",
                  "annotation": "Write the current motif JSON into the chosen library folder. Built-ins are cloned first.",
                  "hint": "Write the current motif JSON into the chosen library folder. Built-ins are cloned first."
                }
              },
              {
                "box": {
                  "id": "obj-197",
                  "maxclass": "live.text",
                  "patching_rect": [
                    12,
                    120,
                    96,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    12,
                    120,
                    96,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "Choose",
                  "texton": "Choose",
                  "varname": "choose-library",
                  "annotation_name": "Choose Motif Library",
                  "annotation": "Select a folder containing additional motif JSON files. Built-in motifs remain available.",
                  "hint": "Select a folder containing additional motif JSON files. Built-in motifs remain available."
                }
              },
              {
                "box": {
                  "id": "obj-198",
                  "maxclass": "live.text",
                  "patching_rect": [
                    116,
                    120,
                    92,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    116,
                    120,
                    92,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "Refresh",
                  "texton": "Refresh",
                  "varname": "refresh-button",
                  "annotation_name": "Refresh Motif Library",
                  "annotation": "Reload built-in motifs and all JSON motifs from the selected library folder.",
                  "hint": "Reload built-in motifs and all JSON motifs from the selected library folder."
                }
              },
              {
                "box": {
                  "id": "obj-199",
                  "maxclass": "textedit",
                  "patching_rect": [
                    224,
                    10,
                    320,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    10,
                    320,
                    22
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 12,
                  "fontface": 1,
                  "bgcolor": [
                    0.08,
                    0.08,
                    0.09,
                    1
                  ],
                  "textcolor": [
                    1,
                    0.55,
                    0.12,
                    1
                  ],
                  "bordercolor": [
                    0.2,
                    0.2,
                    0.22,
                    1
                  ],
                  "keymode": 1,
                  "outputmode": 1,
                  "varname": "name-edit",
                  "annotation_name": "Motif Name",
                  "annotation": "Edit the motif display name. Press Enter to apply (clones built-ins).",
                  "hint": "Edit the motif display name. Press Enter to apply (clones built-ins)."
                }
              },
              {
                "box": {
                  "id": "obj-200",
                  "maxclass": "live.text",
                  "patching_rect": [
                    552,
                    10,
                    72,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    552,
                    10,
                    72,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "Edit",
                  "texton": "Edit",
                  "varname": "edit-button",
                  "annotation_name": "Edit Motif",
                  "annotation": "Clone a built-in into an editable copy so name, description, and notes can be saved.",
                  "hint": "Clone a built-in into an editable copy so name, description, and notes can be saved."
                }
              },
              {
                "box": {
                  "id": "obj-201",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    36,
                    400,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    36,
                    400,
                    14
                  ],
                  "text": "0 notes  •  0 bars",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "motif-stats-display"
                }
              },
              {
                "box": {
                  "id": "obj-202",
                  "maxclass": "textedit",
                  "patching_rect": [
                    224,
                    54,
                    400,
                    40
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    54,
                    400,
                    40
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 11,
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
                  "keymode": 1,
                  "outputmode": 1,
                  "linecount": 2,
                  "varname": "description-edit",
                  "annotation_name": "Motif Description",
                  "annotation": "Edit the motif description. Press Enter to apply (clones built-ins).",
                  "hint": "Edit the motif description. Press Enter to apply (clones built-ins)."
                }
              },
              {
                "box": {
                  "id": "obj-203",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    98,
                    400,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    98,
                    400,
                    14
                  ],
                  "text": "",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "motif-tags-display"
                }
              },
              {
                "box": {
                  "id": "obj-204",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    118,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    118,
                    20,
                    14
                  ],
                  "text": "#",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-205",
                  "maxclass": "comment",
                  "patching_rect": [
                    246,
                    118,
                    52,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    118,
                    52,
                    14
                  ],
                  "text": "Pitch",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-206",
                  "maxclass": "comment",
                  "patching_rect": [
                    302,
                    118,
                    44,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    118,
                    44,
                    14
                  ],
                  "text": "Acc",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-207",
                  "maxclass": "comment",
                  "patching_rect": [
                    350,
                    118,
                    58,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    118,
                    58,
                    14
                  ],
                  "text": "Start",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-208",
                  "maxclass": "comment",
                  "patching_rect": [
                    412,
                    118,
                    58,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    118,
                    58,
                    14
                  ],
                  "text": "Duration",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-209",
                  "maxclass": "comment",
                  "patching_rect": [
                    474,
                    118,
                    46,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    118,
                    46,
                    14
                  ],
                  "text": "Gate",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-210",
                  "maxclass": "comment",
                  "patching_rect": [
                    524,
                    118,
                    52,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    118,
                    52,
                    14
                  ],
                  "text": "Velocity",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ]
                }
              },
              {
                "box": {
                  "id": "obj-211",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    138,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    138,
                    20,
                    14
                  ],
                  "text": "1",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr0-label"
                }
              },
              {
                "box": {
                  "id": "obj-212",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    136,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    136,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr0-pitch",
                  "annotation_name": "Note 1 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-213",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    136,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    136,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr0-acc",
                  "annotation_name": "Note 1 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-214",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    136,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    136,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr0-start",
                  "annotation_name": "Note 1 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-215",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    136,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    136,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr0-dur",
                  "annotation_name": "Note 1 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-216",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    136,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    136,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr0-gate",
                  "annotation_name": "Note 1 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-217",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    136,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    136,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr0-vel",
                  "annotation_name": "Note 1 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-218",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    136,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    136,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr0-remove",
                  "annotation_name": "Remove Note 1",
                  "annotation": "Remove note at row 1 from the current motif.",
                  "hint": "Remove note at row 1 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-219",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    156,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    156,
                    20,
                    14
                  ],
                  "text": "2",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr1-label"
                }
              },
              {
                "box": {
                  "id": "obj-220",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    154,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    154,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr1-pitch",
                  "annotation_name": "Note 2 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-221",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    154,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    154,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr1-acc",
                  "annotation_name": "Note 2 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-222",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    154,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    154,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr1-start",
                  "annotation_name": "Note 2 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-223",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    154,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    154,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr1-dur",
                  "annotation_name": "Note 2 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-224",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    154,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    154,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr1-gate",
                  "annotation_name": "Note 2 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-225",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    154,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    154,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr1-vel",
                  "annotation_name": "Note 2 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-226",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    154,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    154,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr1-remove",
                  "annotation_name": "Remove Note 2",
                  "annotation": "Remove note at row 2 from the current motif.",
                  "hint": "Remove note at row 2 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-227",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    174,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    174,
                    20,
                    14
                  ],
                  "text": "3",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr2-label"
                }
              },
              {
                "box": {
                  "id": "obj-228",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    172,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    172,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr2-pitch",
                  "annotation_name": "Note 3 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-229",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    172,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    172,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr2-acc",
                  "annotation_name": "Note 3 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-230",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    172,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    172,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr2-start",
                  "annotation_name": "Note 3 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-231",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    172,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    172,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr2-dur",
                  "annotation_name": "Note 3 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-232",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    172,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    172,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr2-gate",
                  "annotation_name": "Note 3 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-233",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    172,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    172,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr2-vel",
                  "annotation_name": "Note 3 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-234",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    172,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    172,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr2-remove",
                  "annotation_name": "Remove Note 3",
                  "annotation": "Remove note at row 3 from the current motif.",
                  "hint": "Remove note at row 3 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-235",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    192,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    192,
                    20,
                    14
                  ],
                  "text": "4",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr3-label"
                }
              },
              {
                "box": {
                  "id": "obj-236",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    190,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    190,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr3-pitch",
                  "annotation_name": "Note 4 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-237",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    190,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    190,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr3-acc",
                  "annotation_name": "Note 4 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-238",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    190,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    190,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr3-start",
                  "annotation_name": "Note 4 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-239",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    190,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    190,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr3-dur",
                  "annotation_name": "Note 4 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-240",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    190,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    190,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr3-gate",
                  "annotation_name": "Note 4 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-241",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    190,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    190,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr3-vel",
                  "annotation_name": "Note 4 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-242",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    190,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    190,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr3-remove",
                  "annotation_name": "Remove Note 4",
                  "annotation": "Remove note at row 4 from the current motif.",
                  "hint": "Remove note at row 4 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-243",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    210,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    210,
                    20,
                    14
                  ],
                  "text": "5",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr4-label"
                }
              },
              {
                "box": {
                  "id": "obj-244",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    208,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    208,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr4-pitch",
                  "annotation_name": "Note 5 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-245",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    208,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    208,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr4-acc",
                  "annotation_name": "Note 5 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-246",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    208,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    208,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr4-start",
                  "annotation_name": "Note 5 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-247",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    208,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    208,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr4-dur",
                  "annotation_name": "Note 5 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-248",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    208,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    208,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr4-gate",
                  "annotation_name": "Note 5 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-249",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    208,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    208,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr4-vel",
                  "annotation_name": "Note 5 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-250",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    208,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    208,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr4-remove",
                  "annotation_name": "Remove Note 5",
                  "annotation": "Remove note at row 5 from the current motif.",
                  "hint": "Remove note at row 5 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-251",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    228,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    228,
                    20,
                    14
                  ],
                  "text": "6",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr5-label"
                }
              },
              {
                "box": {
                  "id": "obj-252",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    226,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    226,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr5-pitch",
                  "annotation_name": "Note 6 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-253",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    226,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    226,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr5-acc",
                  "annotation_name": "Note 6 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-254",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    226,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    226,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr5-start",
                  "annotation_name": "Note 6 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-255",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    226,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    226,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr5-dur",
                  "annotation_name": "Note 6 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-256",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    226,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    226,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr5-gate",
                  "annotation_name": "Note 6 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-257",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    226,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    226,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr5-vel",
                  "annotation_name": "Note 6 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-258",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    226,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    226,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr5-remove",
                  "annotation_name": "Remove Note 6",
                  "annotation": "Remove note at row 6 from the current motif.",
                  "hint": "Remove note at row 6 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-259",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    246,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    246,
                    20,
                    14
                  ],
                  "text": "7",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr6-label"
                }
              },
              {
                "box": {
                  "id": "obj-260",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    244,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    244,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr6-pitch",
                  "annotation_name": "Note 7 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-261",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    244,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    244,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr6-acc",
                  "annotation_name": "Note 7 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-262",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    244,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    244,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr6-start",
                  "annotation_name": "Note 7 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-263",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    244,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    244,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr6-dur",
                  "annotation_name": "Note 7 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-264",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    244,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    244,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr6-gate",
                  "annotation_name": "Note 7 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-265",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    244,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    244,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr6-vel",
                  "annotation_name": "Note 7 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-266",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    244,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    244,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr6-remove",
                  "annotation_name": "Remove Note 7",
                  "annotation": "Remove note at row 7 from the current motif.",
                  "hint": "Remove note at row 7 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-267",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    264,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    264,
                    20,
                    14
                  ],
                  "text": "8",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr7-label"
                }
              },
              {
                "box": {
                  "id": "obj-268",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    262,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    262,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr7-pitch",
                  "annotation_name": "Note 8 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-269",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    262,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    262,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr7-acc",
                  "annotation_name": "Note 8 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-270",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    262,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    262,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr7-start",
                  "annotation_name": "Note 8 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-271",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    262,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    262,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr7-dur",
                  "annotation_name": "Note 8 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-272",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    262,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    262,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr7-gate",
                  "annotation_name": "Note 8 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-273",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    262,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    262,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr7-vel",
                  "annotation_name": "Note 8 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-274",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    262,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    262,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr7-remove",
                  "annotation_name": "Remove Note 8",
                  "annotation": "Remove note at row 8 from the current motif.",
                  "hint": "Remove note at row 8 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-275",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    282,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    282,
                    20,
                    14
                  ],
                  "text": "9",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr8-label"
                }
              },
              {
                "box": {
                  "id": "obj-276",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    280,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    280,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr8-pitch",
                  "annotation_name": "Note 9 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-277",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    280,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    280,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr8-acc",
                  "annotation_name": "Note 9 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-278",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    280,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    280,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr8-start",
                  "annotation_name": "Note 9 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-279",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    280,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    280,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr8-dur",
                  "annotation_name": "Note 9 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-280",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    280,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    280,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr8-gate",
                  "annotation_name": "Note 9 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-281",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    280,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    280,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr8-vel",
                  "annotation_name": "Note 9 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-282",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    280,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    280,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr8-remove",
                  "annotation_name": "Remove Note 9",
                  "annotation": "Remove note at row 9 from the current motif.",
                  "hint": "Remove note at row 9 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-283",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    300,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    300,
                    20,
                    14
                  ],
                  "text": "10",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr9-label"
                }
              },
              {
                "box": {
                  "id": "obj-284",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    298,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    298,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr9-pitch",
                  "annotation_name": "Note 10 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-285",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    298,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    298,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr9-acc",
                  "annotation_name": "Note 10 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-286",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    298,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    298,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr9-start",
                  "annotation_name": "Note 10 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-287",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    298,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    298,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr9-dur",
                  "annotation_name": "Note 10 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-288",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    298,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    298,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr9-gate",
                  "annotation_name": "Note 10 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-289",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    298,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    298,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr9-vel",
                  "annotation_name": "Note 10 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-290",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    298,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    298,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr9-remove",
                  "annotation_name": "Remove Note 10",
                  "annotation": "Remove note at row 10 from the current motif.",
                  "hint": "Remove note at row 10 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-291",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    318,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    318,
                    20,
                    14
                  ],
                  "text": "11",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr10-label"
                }
              },
              {
                "box": {
                  "id": "obj-292",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    316,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    316,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr10-pitch",
                  "annotation_name": "Note 11 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-293",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    316,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    316,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr10-acc",
                  "annotation_name": "Note 11 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-294",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    316,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    316,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr10-start",
                  "annotation_name": "Note 11 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-295",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    316,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    316,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr10-dur",
                  "annotation_name": "Note 11 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-296",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    316,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    316,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr10-gate",
                  "annotation_name": "Note 11 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-297",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    316,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    316,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr10-vel",
                  "annotation_name": "Note 11 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-298",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    316,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    316,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr10-remove",
                  "annotation_name": "Remove Note 11",
                  "annotation": "Remove note at row 11 from the current motif.",
                  "hint": "Remove note at row 11 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-299",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    336,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    336,
                    20,
                    14
                  ],
                  "text": "12",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr11-label"
                }
              },
              {
                "box": {
                  "id": "obj-300",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    334,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    334,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr11-pitch",
                  "annotation_name": "Note 12 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-301",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    334,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    334,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr11-acc",
                  "annotation_name": "Note 12 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-302",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    334,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    334,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr11-start",
                  "annotation_name": "Note 12 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-303",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    334,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    334,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr11-dur",
                  "annotation_name": "Note 12 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-304",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    334,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    334,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr11-gate",
                  "annotation_name": "Note 12 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-305",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    334,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    334,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr11-vel",
                  "annotation_name": "Note 12 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-306",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    334,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    334,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr11-remove",
                  "annotation_name": "Remove Note 12",
                  "annotation": "Remove note at row 12 from the current motif.",
                  "hint": "Remove note at row 12 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-307",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    354,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    354,
                    20,
                    14
                  ],
                  "text": "13",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr12-label"
                }
              },
              {
                "box": {
                  "id": "obj-308",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    352,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    352,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr12-pitch",
                  "annotation_name": "Note 13 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-309",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    352,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    352,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr12-acc",
                  "annotation_name": "Note 13 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-310",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    352,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    352,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr12-start",
                  "annotation_name": "Note 13 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-311",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    352,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    352,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr12-dur",
                  "annotation_name": "Note 13 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-312",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    352,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    352,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr12-gate",
                  "annotation_name": "Note 13 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-313",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    352,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    352,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr12-vel",
                  "annotation_name": "Note 13 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-314",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    352,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    352,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr12-remove",
                  "annotation_name": "Remove Note 13",
                  "annotation": "Remove note at row 13 from the current motif.",
                  "hint": "Remove note at row 13 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-315",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    372,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    372,
                    20,
                    14
                  ],
                  "text": "14",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr13-label"
                }
              },
              {
                "box": {
                  "id": "obj-316",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    370,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    370,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr13-pitch",
                  "annotation_name": "Note 14 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-317",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    370,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    370,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr13-acc",
                  "annotation_name": "Note 14 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-318",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    370,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    370,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr13-start",
                  "annotation_name": "Note 14 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-319",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    370,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    370,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr13-dur",
                  "annotation_name": "Note 14 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-320",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    370,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    370,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr13-gate",
                  "annotation_name": "Note 14 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-321",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    370,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    370,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr13-vel",
                  "annotation_name": "Note 14 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-322",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    370,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    370,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr13-remove",
                  "annotation_name": "Remove Note 14",
                  "annotation": "Remove note at row 14 from the current motif.",
                  "hint": "Remove note at row 14 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-323",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    390,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    390,
                    20,
                    14
                  ],
                  "text": "15",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr14-label"
                }
              },
              {
                "box": {
                  "id": "obj-324",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    388,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    388,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr14-pitch",
                  "annotation_name": "Note 15 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-325",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    388,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    388,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr14-acc",
                  "annotation_name": "Note 15 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-326",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    388,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    388,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr14-start",
                  "annotation_name": "Note 15 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-327",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    388,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    388,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr14-dur",
                  "annotation_name": "Note 15 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-328",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    388,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    388,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr14-gate",
                  "annotation_name": "Note 15 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-329",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    388,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    388,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr14-vel",
                  "annotation_name": "Note 15 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-330",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    388,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    388,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr14-remove",
                  "annotation_name": "Remove Note 15",
                  "annotation": "Remove note at row 15 from the current motif.",
                  "hint": "Remove note at row 15 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-331",
                  "maxclass": "comment",
                  "patching_rect": [
                    224,
                    408,
                    20,
                    14
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    408,
                    20,
                    14
                  ],
                  "text": "16",
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "textcolor": [
                    0.58,
                    0.59,
                    0.63,
                    1
                  ],
                  "varname": "nr15-label"
                }
              },
              {
                "box": {
                  "id": "obj-332",
                  "maxclass": "number",
                  "patching_rect": [
                    246,
                    406,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    246,
                    406,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -48,
                  "maximum": 48,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr15-pitch",
                  "annotation_name": "Note 16 pitch",
                  "annotation": "Relative pitch (degree or semitone).",
                  "hint": "Relative pitch (degree or semitone)."
                }
              },
              {
                "box": {
                  "id": "obj-333",
                  "maxclass": "number",
                  "patching_rect": [
                    302,
                    406,
                    44,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    302,
                    406,
                    44,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": -12,
                  "maximum": 12,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr15-acc",
                  "annotation_name": "Note 16 acc",
                  "annotation": "Hybrid accidental in semitones (0 clears).",
                  "hint": "Hybrid accidental in semitones (0 clears)."
                }
              },
              {
                "box": {
                  "id": "obj-334",
                  "maxclass": "number",
                  "patching_rect": [
                    350,
                    406,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    350,
                    406,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr15-start",
                  "annotation_name": "Note 16 start",
                  "annotation": "Note start in PPQ ticks (960 = quarter note).",
                  "hint": "Note start in PPQ ticks (960 = quarter note)."
                }
              },
              {
                "box": {
                  "id": "obj-335",
                  "maxclass": "number",
                  "patching_rect": [
                    412,
                    406,
                    58,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    412,
                    406,
                    58,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 1,
                  "maximum": 30720,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr15-dur",
                  "annotation_name": "Note 16 dur",
                  "annotation": "Note duration in PPQ ticks.",
                  "hint": "Note duration in PPQ ticks."
                }
              },
              {
                "box": {
                  "id": "obj-336",
                  "maxclass": "number",
                  "patching_rect": [
                    474,
                    406,
                    46,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    474,
                    406,
                    46,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 2,
                  "numdecimalplaces": 2,
                  "format": 6,
                  "varname": "nr15-gate",
                  "annotation_name": "Note 16 gate",
                  "annotation": "Gate multiplier (0 clears per-note gate).",
                  "hint": "Gate multiplier (0 clears per-note gate)."
                }
              },
              {
                "box": {
                  "id": "obj-337",
                  "maxclass": "number",
                  "patching_rect": [
                    524,
                    406,
                    52,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    524,
                    406,
                    52,
                    18
                  ],
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
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
                  "minimum": 0,
                  "maximum": 127,
                  "numdecimalplaces": 0,
                  "format": 0,
                  "varname": "nr15-vel",
                  "annotation_name": "Note 16 vel",
                  "annotation": "Velocity 1–127 (0 = use trigger curve).",
                  "hint": "Velocity 1–127 (0 = use trigger curve)."
                }
              },
              {
                "box": {
                  "id": "obj-338",
                  "maxclass": "live.text",
                  "patching_rect": [
                    580,
                    406,
                    22,
                    18
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    580,
                    406,
                    22,
                    18
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "−",
                  "texton": "−",
                  "varname": "nr15-remove",
                  "annotation_name": "Remove Note 16",
                  "annotation": "Remove note at row 16 from the current motif.",
                  "hint": "Remove note at row 16 from the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-339",
                  "maxclass": "live.text",
                  "patching_rect": [
                    224,
                    432,
                    100,
                    22
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    224,
                    432,
                    100,
                    22
                  ],
                  "appearance": 0,
                  "fontname": "Ableton Sans",
                  "fontsize": 9,
                  "mode": 0,
                  "outputmode": 1,
                  "parameter_enable": 0,
                  "text": "+ Add Note",
                  "texton": "+ Add Note",
                  "varname": "add-note-button",
                  "annotation_name": "Add Note",
                  "annotation": "Append a new default note at the end of the current motif.",
                  "hint": "Append a new default note at the end of the current motif."
                }
              },
              {
                "box": {
                  "id": "obj-340",
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
                  "id": "obj-341",
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
                  "id": "obj-342",
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
                  "id": "obj-343",
                  "maxclass": "newobj",
                  "patching_rect": [
                    520,
                    500,
                    170,
                    22
                  ],
                  "text": "send ---motif_author"
                }
              },
              {
                "box": {
                  "id": "obj-344",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    572,
                    160,
                    22
                  ],
                  "text": "receive ---motif-title"
                }
              },
              {
                "box": {
                  "id": "obj-345",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    608,
                    160,
                    22
                  ],
                  "text": "receive ---motif-stats"
                }
              },
              {
                "box": {
                  "id": "obj-346",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    644,
                    190,
                    22
                  ],
                  "text": "receive ---motif-description"
                }
              },
              {
                "box": {
                  "id": "obj-347",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    680,
                    160,
                    22
                  ],
                  "text": "receive ---motif-tags"
                }
              },
              {
                "box": {
                  "id": "obj-348",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    572,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-349",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    608,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-350",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    644,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-351",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    680,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-352",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    752,
                    180,
                    22
                  ],
                  "text": "receive ---browser-clear"
                }
              },
              {
                "box": {
                  "id": "obj-353",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    788,
                    190,
                    22
                  ],
                  "text": "receive ---browser-append"
                }
              },
              {
                "box": {
                  "id": "obj-354",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    824,
                    190,
                    22
                  ],
                  "text": "receive ---browser-select"
                }
              },
              {
                "box": {
                  "id": "obj-355",
                  "maxclass": "message",
                  "patching_rect": [
                    240,
                    752,
                    60,
                    22
                  ],
                  "text": "clear"
                }
              },
              {
                "box": {
                  "id": "obj-356",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    788,
                    100,
                    22
                  ],
                  "text": "zl slice 1"
                }
              },
              {
                "box": {
                  "id": "obj-357",
                  "maxclass": "newobj",
                  "patching_rect": [
                    380,
                    788,
                    120,
                    22
                  ],
                  "text": "prepend append"
                }
              },
              {
                "box": {
                  "id": "obj-358",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    824,
                    120,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-359",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    896,
                    180,
                    22
                  ],
                  "text": "receive ---note-row-vis"
                }
              },
              {
                "box": {
                  "id": "obj-360",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    896,
                    380,
                    22
                  ],
                  "text": "route 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"
                }
              },
              {
                "box": {
                  "id": "obj-361",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    968,
                    180,
                    22
                  ],
                  "text": "receive ---note-row-data"
                }
              },
              {
                "box": {
                  "id": "obj-362",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    968,
                    380,
                    22
                  ],
                  "text": "route 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"
                }
              },
              {
                "box": {
                  "id": "obj-363",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1076,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-364",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1076,
                    600,
                    22
                  ],
                  "text": "script sendbox nr0-label presentation 0 , script sendbox nr0-pitch presentation 0 , script sendbox nr0-acc presentation 0 , script sendbox nr0-start presentation 0 , script sendbox nr0-dur presentation 0 , script sendbox nr0-gate presentation 0 , script sendbox nr0-vel presentation 0 , script sendbox nr0-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-365",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1076,
                    600,
                    22
                  ],
                  "text": "script sendbox nr0-label presentation 1 , script sendbox nr0-pitch presentation 1 , script sendbox nr0-acc presentation 1 , script sendbox nr0-start presentation 1 , script sendbox nr0-dur presentation 1 , script sendbox nr0-gate presentation 1 , script sendbox nr0-vel presentation 1 , script sendbox nr0-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-366",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    2876,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-367",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    2876,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-368",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    2912,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-369",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    2948,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-370",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    2984,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-371",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3020,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-372",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3056,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-373",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    7556,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 0"
                }
              },
              {
                "box": {
                  "id": "obj-374",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7592,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-375",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7628,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-376",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7664,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-377",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7700,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-378",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7736,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-379",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7772,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-380",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    7556,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 0"
                }
              },
              {
                "box": {
                  "id": "obj-381",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1184,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-382",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1184,
                    600,
                    22
                  ],
                  "text": "script sendbox nr1-label presentation 0 , script sendbox nr1-pitch presentation 0 , script sendbox nr1-acc presentation 0 , script sendbox nr1-start presentation 0 , script sendbox nr1-dur presentation 0 , script sendbox nr1-gate presentation 0 , script sendbox nr1-vel presentation 0 , script sendbox nr1-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-383",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1184,
                    600,
                    22
                  ],
                  "text": "script sendbox nr1-label presentation 1 , script sendbox nr1-pitch presentation 1 , script sendbox nr1-acc presentation 1 , script sendbox nr1-start presentation 1 , script sendbox nr1-dur presentation 1 , script sendbox nr1-gate presentation 1 , script sendbox nr1-vel presentation 1 , script sendbox nr1-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-384",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    3164,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-385",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3164,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-386",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3200,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-387",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3236,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-388",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3272,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-389",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3308,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-390",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3344,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-391",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    7880,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 1"
                }
              },
              {
                "box": {
                  "id": "obj-392",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7916,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-393",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7952,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-394",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    7988,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-395",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8024,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-396",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8060,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-397",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8096,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-398",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    7880,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 1"
                }
              },
              {
                "box": {
                  "id": "obj-399",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1292,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-400",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1292,
                    600,
                    22
                  ],
                  "text": "script sendbox nr2-label presentation 0 , script sendbox nr2-pitch presentation 0 , script sendbox nr2-acc presentation 0 , script sendbox nr2-start presentation 0 , script sendbox nr2-dur presentation 0 , script sendbox nr2-gate presentation 0 , script sendbox nr2-vel presentation 0 , script sendbox nr2-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-401",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1292,
                    600,
                    22
                  ],
                  "text": "script sendbox nr2-label presentation 1 , script sendbox nr2-pitch presentation 1 , script sendbox nr2-acc presentation 1 , script sendbox nr2-start presentation 1 , script sendbox nr2-dur presentation 1 , script sendbox nr2-gate presentation 1 , script sendbox nr2-vel presentation 1 , script sendbox nr2-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-402",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    3452,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-403",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3452,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-404",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3488,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-405",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3524,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-406",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3560,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-407",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3596,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-408",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3632,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-409",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    8204,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 2"
                }
              },
              {
                "box": {
                  "id": "obj-410",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8240,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-411",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8276,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-412",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8312,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-413",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8348,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-414",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8384,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-415",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8420,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-416",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    8204,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 2"
                }
              },
              {
                "box": {
                  "id": "obj-417",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1400,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-418",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1400,
                    600,
                    22
                  ],
                  "text": "script sendbox nr3-label presentation 0 , script sendbox nr3-pitch presentation 0 , script sendbox nr3-acc presentation 0 , script sendbox nr3-start presentation 0 , script sendbox nr3-dur presentation 0 , script sendbox nr3-gate presentation 0 , script sendbox nr3-vel presentation 0 , script sendbox nr3-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-419",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1400,
                    600,
                    22
                  ],
                  "text": "script sendbox nr3-label presentation 1 , script sendbox nr3-pitch presentation 1 , script sendbox nr3-acc presentation 1 , script sendbox nr3-start presentation 1 , script sendbox nr3-dur presentation 1 , script sendbox nr3-gate presentation 1 , script sendbox nr3-vel presentation 1 , script sendbox nr3-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-420",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    3740,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-421",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3740,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-422",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3776,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-423",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3812,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-424",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3848,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-425",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3884,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-426",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    3920,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-427",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    8528,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 3"
                }
              },
              {
                "box": {
                  "id": "obj-428",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8564,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-429",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8600,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-430",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8636,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-431",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8672,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-432",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8708,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-433",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8744,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-434",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    8528,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 3"
                }
              },
              {
                "box": {
                  "id": "obj-435",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1508,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-436",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1508,
                    600,
                    22
                  ],
                  "text": "script sendbox nr4-label presentation 0 , script sendbox nr4-pitch presentation 0 , script sendbox nr4-acc presentation 0 , script sendbox nr4-start presentation 0 , script sendbox nr4-dur presentation 0 , script sendbox nr4-gate presentation 0 , script sendbox nr4-vel presentation 0 , script sendbox nr4-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-437",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1508,
                    600,
                    22
                  ],
                  "text": "script sendbox nr4-label presentation 1 , script sendbox nr4-pitch presentation 1 , script sendbox nr4-acc presentation 1 , script sendbox nr4-start presentation 1 , script sendbox nr4-dur presentation 1 , script sendbox nr4-gate presentation 1 , script sendbox nr4-vel presentation 1 , script sendbox nr4-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-438",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    4028,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-439",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4028,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-440",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4064,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-441",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4100,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-442",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4136,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-443",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4172,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-444",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4208,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-445",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    8852,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 4"
                }
              },
              {
                "box": {
                  "id": "obj-446",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8888,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-447",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8924,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-448",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8960,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-449",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    8996,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-450",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9032,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-451",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9068,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-452",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    8852,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 4"
                }
              },
              {
                "box": {
                  "id": "obj-453",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1616,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-454",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1616,
                    600,
                    22
                  ],
                  "text": "script sendbox nr5-label presentation 0 , script sendbox nr5-pitch presentation 0 , script sendbox nr5-acc presentation 0 , script sendbox nr5-start presentation 0 , script sendbox nr5-dur presentation 0 , script sendbox nr5-gate presentation 0 , script sendbox nr5-vel presentation 0 , script sendbox nr5-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-455",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1616,
                    600,
                    22
                  ],
                  "text": "script sendbox nr5-label presentation 1 , script sendbox nr5-pitch presentation 1 , script sendbox nr5-acc presentation 1 , script sendbox nr5-start presentation 1 , script sendbox nr5-dur presentation 1 , script sendbox nr5-gate presentation 1 , script sendbox nr5-vel presentation 1 , script sendbox nr5-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-456",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    4316,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-457",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4316,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-458",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4352,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-459",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4388,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-460",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4424,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-461",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4460,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-462",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4496,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-463",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    9176,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 5"
                }
              },
              {
                "box": {
                  "id": "obj-464",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9212,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-465",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9248,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-466",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9284,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-467",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9320,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-468",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9356,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-469",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9392,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-470",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    9176,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 5"
                }
              },
              {
                "box": {
                  "id": "obj-471",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1724,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-472",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1724,
                    600,
                    22
                  ],
                  "text": "script sendbox nr6-label presentation 0 , script sendbox nr6-pitch presentation 0 , script sendbox nr6-acc presentation 0 , script sendbox nr6-start presentation 0 , script sendbox nr6-dur presentation 0 , script sendbox nr6-gate presentation 0 , script sendbox nr6-vel presentation 0 , script sendbox nr6-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-473",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1724,
                    600,
                    22
                  ],
                  "text": "script sendbox nr6-label presentation 1 , script sendbox nr6-pitch presentation 1 , script sendbox nr6-acc presentation 1 , script sendbox nr6-start presentation 1 , script sendbox nr6-dur presentation 1 , script sendbox nr6-gate presentation 1 , script sendbox nr6-vel presentation 1 , script sendbox nr6-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-474",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    4604,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-475",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4604,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-476",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4640,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-477",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4676,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-478",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4712,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-479",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4748,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-480",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4784,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-481",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    9500,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 6"
                }
              },
              {
                "box": {
                  "id": "obj-482",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9536,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-483",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9572,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-484",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9608,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-485",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9644,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-486",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9680,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-487",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9716,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-488",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    9500,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 6"
                }
              },
              {
                "box": {
                  "id": "obj-489",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1832,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-490",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1832,
                    600,
                    22
                  ],
                  "text": "script sendbox nr7-label presentation 0 , script sendbox nr7-pitch presentation 0 , script sendbox nr7-acc presentation 0 , script sendbox nr7-start presentation 0 , script sendbox nr7-dur presentation 0 , script sendbox nr7-gate presentation 0 , script sendbox nr7-vel presentation 0 , script sendbox nr7-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-491",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1832,
                    600,
                    22
                  ],
                  "text": "script sendbox nr7-label presentation 1 , script sendbox nr7-pitch presentation 1 , script sendbox nr7-acc presentation 1 , script sendbox nr7-start presentation 1 , script sendbox nr7-dur presentation 1 , script sendbox nr7-gate presentation 1 , script sendbox nr7-vel presentation 1 , script sendbox nr7-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-492",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    4892,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-493",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4892,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-494",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4928,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-495",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    4964,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-496",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5000,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-497",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5036,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-498",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5072,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-499",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    9824,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 7"
                }
              },
              {
                "box": {
                  "id": "obj-500",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9860,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-501",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9896,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-502",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9932,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-503",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    9968,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-504",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10004,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-505",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10040,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-506",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    9824,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 7"
                }
              },
              {
                "box": {
                  "id": "obj-507",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1940,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-508",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    1940,
                    600,
                    22
                  ],
                  "text": "script sendbox nr8-label presentation 0 , script sendbox nr8-pitch presentation 0 , script sendbox nr8-acc presentation 0 , script sendbox nr8-start presentation 0 , script sendbox nr8-dur presentation 0 , script sendbox nr8-gate presentation 0 , script sendbox nr8-vel presentation 0 , script sendbox nr8-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-509",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    1940,
                    600,
                    22
                  ],
                  "text": "script sendbox nr8-label presentation 1 , script sendbox nr8-pitch presentation 1 , script sendbox nr8-acc presentation 1 , script sendbox nr8-start presentation 1 , script sendbox nr8-dur presentation 1 , script sendbox nr8-gate presentation 1 , script sendbox nr8-vel presentation 1 , script sendbox nr8-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-510",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    5180,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-511",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5180,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-512",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5216,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-513",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5252,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-514",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5288,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-515",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5324,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-516",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5360,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-517",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    10148,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 8"
                }
              },
              {
                "box": {
                  "id": "obj-518",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10184,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-519",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10220,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-520",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10256,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-521",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10292,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-522",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10328,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-523",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10364,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-524",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    10148,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 8"
                }
              },
              {
                "box": {
                  "id": "obj-525",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2048,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-526",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2048,
                    600,
                    22
                  ],
                  "text": "script sendbox nr9-label presentation 0 , script sendbox nr9-pitch presentation 0 , script sendbox nr9-acc presentation 0 , script sendbox nr9-start presentation 0 , script sendbox nr9-dur presentation 0 , script sendbox nr9-gate presentation 0 , script sendbox nr9-vel presentation 0 , script sendbox nr9-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-527",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2048,
                    600,
                    22
                  ],
                  "text": "script sendbox nr9-label presentation 1 , script sendbox nr9-pitch presentation 1 , script sendbox nr9-acc presentation 1 , script sendbox nr9-start presentation 1 , script sendbox nr9-dur presentation 1 , script sendbox nr9-gate presentation 1 , script sendbox nr9-vel presentation 1 , script sendbox nr9-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-528",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    5468,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-529",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5468,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-530",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5504,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-531",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5540,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-532",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5576,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-533",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5612,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-534",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5648,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-535",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    10472,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 9"
                }
              },
              {
                "box": {
                  "id": "obj-536",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10508,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-537",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10544,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-538",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10580,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-539",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10616,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-540",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10652,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-541",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10688,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-542",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    10472,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 9"
                }
              },
              {
                "box": {
                  "id": "obj-543",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2156,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-544",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2156,
                    600,
                    22
                  ],
                  "text": "script sendbox nr10-label presentation 0 , script sendbox nr10-pitch presentation 0 , script sendbox nr10-acc presentation 0 , script sendbox nr10-start presentation 0 , script sendbox nr10-dur presentation 0 , script sendbox nr10-gate presentation 0 , script sendbox nr10-vel presentation 0 , script sendbox nr10-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-545",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2156,
                    600,
                    22
                  ],
                  "text": "script sendbox nr10-label presentation 1 , script sendbox nr10-pitch presentation 1 , script sendbox nr10-acc presentation 1 , script sendbox nr10-start presentation 1 , script sendbox nr10-dur presentation 1 , script sendbox nr10-gate presentation 1 , script sendbox nr10-vel presentation 1 , script sendbox nr10-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-546",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    5756,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-547",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5756,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-548",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5792,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-549",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5828,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-550",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5864,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-551",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5900,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-552",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    5936,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-553",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    10796,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 10"
                }
              },
              {
                "box": {
                  "id": "obj-554",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10832,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-555",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10868,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-556",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10904,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-557",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10940,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-558",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    10976,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-559",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11012,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-560",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    10796,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 10"
                }
              },
              {
                "box": {
                  "id": "obj-561",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2264,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-562",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2264,
                    600,
                    22
                  ],
                  "text": "script sendbox nr11-label presentation 0 , script sendbox nr11-pitch presentation 0 , script sendbox nr11-acc presentation 0 , script sendbox nr11-start presentation 0 , script sendbox nr11-dur presentation 0 , script sendbox nr11-gate presentation 0 , script sendbox nr11-vel presentation 0 , script sendbox nr11-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-563",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2264,
                    600,
                    22
                  ],
                  "text": "script sendbox nr11-label presentation 1 , script sendbox nr11-pitch presentation 1 , script sendbox nr11-acc presentation 1 , script sendbox nr11-start presentation 1 , script sendbox nr11-dur presentation 1 , script sendbox nr11-gate presentation 1 , script sendbox nr11-vel presentation 1 , script sendbox nr11-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-564",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    6044,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-565",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6044,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-566",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6080,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-567",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6116,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-568",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6152,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-569",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6188,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-570",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6224,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-571",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    11120,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 11"
                }
              },
              {
                "box": {
                  "id": "obj-572",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11156,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-573",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11192,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-574",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11228,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-575",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11264,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-576",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11300,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-577",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11336,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-578",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    11120,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 11"
                }
              },
              {
                "box": {
                  "id": "obj-579",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2372,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-580",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2372,
                    600,
                    22
                  ],
                  "text": "script sendbox nr12-label presentation 0 , script sendbox nr12-pitch presentation 0 , script sendbox nr12-acc presentation 0 , script sendbox nr12-start presentation 0 , script sendbox nr12-dur presentation 0 , script sendbox nr12-gate presentation 0 , script sendbox nr12-vel presentation 0 , script sendbox nr12-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-581",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2372,
                    600,
                    22
                  ],
                  "text": "script sendbox nr12-label presentation 1 , script sendbox nr12-pitch presentation 1 , script sendbox nr12-acc presentation 1 , script sendbox nr12-start presentation 1 , script sendbox nr12-dur presentation 1 , script sendbox nr12-gate presentation 1 , script sendbox nr12-vel presentation 1 , script sendbox nr12-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-582",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    6332,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-583",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6332,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-584",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6368,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-585",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6404,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-586",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6440,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-587",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6476,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-588",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6512,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-589",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    11444,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 12"
                }
              },
              {
                "box": {
                  "id": "obj-590",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11480,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-591",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11516,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-592",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11552,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-593",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11588,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-594",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11624,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-595",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11660,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-596",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    11444,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 12"
                }
              },
              {
                "box": {
                  "id": "obj-597",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2480,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-598",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2480,
                    600,
                    22
                  ],
                  "text": "script sendbox nr13-label presentation 0 , script sendbox nr13-pitch presentation 0 , script sendbox nr13-acc presentation 0 , script sendbox nr13-start presentation 0 , script sendbox nr13-dur presentation 0 , script sendbox nr13-gate presentation 0 , script sendbox nr13-vel presentation 0 , script sendbox nr13-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-599",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2480,
                    600,
                    22
                  ],
                  "text": "script sendbox nr13-label presentation 1 , script sendbox nr13-pitch presentation 1 , script sendbox nr13-acc presentation 1 , script sendbox nr13-start presentation 1 , script sendbox nr13-dur presentation 1 , script sendbox nr13-gate presentation 1 , script sendbox nr13-vel presentation 1 , script sendbox nr13-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-600",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    6620,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-601",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6620,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-602",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6656,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-603",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6692,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-604",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6728,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-605",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6764,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-606",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6800,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-607",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    11768,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 13"
                }
              },
              {
                "box": {
                  "id": "obj-608",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11804,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-609",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11840,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-610",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11876,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-611",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11912,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-612",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11948,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-613",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    11984,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-614",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    11768,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 13"
                }
              },
              {
                "box": {
                  "id": "obj-615",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2588,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-616",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2588,
                    600,
                    22
                  ],
                  "text": "script sendbox nr14-label presentation 0 , script sendbox nr14-pitch presentation 0 , script sendbox nr14-acc presentation 0 , script sendbox nr14-start presentation 0 , script sendbox nr14-dur presentation 0 , script sendbox nr14-gate presentation 0 , script sendbox nr14-vel presentation 0 , script sendbox nr14-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-617",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2588,
                    600,
                    22
                  ],
                  "text": "script sendbox nr14-label presentation 1 , script sendbox nr14-pitch presentation 1 , script sendbox nr14-acc presentation 1 , script sendbox nr14-start presentation 1 , script sendbox nr14-dur presentation 1 , script sendbox nr14-gate presentation 1 , script sendbox nr14-vel presentation 1 , script sendbox nr14-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-618",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    6908,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-619",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6908,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-620",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6944,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-621",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    6980,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-622",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7016,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-623",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7052,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-624",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7088,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-625",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    12092,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 14"
                }
              },
              {
                "box": {
                  "id": "obj-626",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12128,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-627",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12164,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-628",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12200,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-629",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12236,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-630",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12272,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-631",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12308,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-632",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    12092,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 14"
                }
              },
              {
                "box": {
                  "id": "obj-633",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    2696,
                    80,
                    22
                  ],
                  "text": "sel 0 1"
                }
              },
              {
                "box": {
                  "id": "obj-634",
                  "maxclass": "message",
                  "patching_rect": [
                    140,
                    2696,
                    600,
                    22
                  ],
                  "text": "script sendbox nr15-label presentation 0 , script sendbox nr15-pitch presentation 0 , script sendbox nr15-acc presentation 0 , script sendbox nr15-start presentation 0 , script sendbox nr15-dur presentation 0 , script sendbox nr15-gate presentation 0 , script sendbox nr15-vel presentation 0 , script sendbox nr15-remove presentation 0"
                }
              },
              {
                "box": {
                  "id": "obj-635",
                  "maxclass": "message",
                  "patching_rect": [
                    780,
                    2696,
                    600,
                    22
                  ],
                  "text": "script sendbox nr15-label presentation 1 , script sendbox nr15-pitch presentation 1 , script sendbox nr15-acc presentation 1 , script sendbox nr15-start presentation 1 , script sendbox nr15-dur presentation 1 , script sendbox nr15-gate presentation 1 , script sendbox nr15-vel presentation 1 , script sendbox nr15-remove presentation 1"
                }
              },
              {
                "box": {
                  "id": "obj-636",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    7196,
                    200,
                    22
                  ],
                  "text": "unpack 0 0 0 0 0. 0"
                }
              },
              {
                "box": {
                  "id": "obj-637",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7196,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-638",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7232,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-639",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7268,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-640",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7304,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-641",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7340,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-642",
                  "maxclass": "newobj",
                  "patching_rect": [
                    480,
                    7376,
                    100,
                    22
                  ],
                  "text": "prepend set"
                }
              },
              {
                "box": {
                  "id": "obj-643",
                  "maxclass": "newobj",
                  "patching_rect": [
                    640,
                    12416,
                    170,
                    22
                  ],
                  "text": "prepend edit_note_at 15"
                }
              },
              {
                "box": {
                  "id": "obj-644",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12452,
                    160,
                    22
                  ],
                  "text": "prepend pitch"
                }
              },
              {
                "box": {
                  "id": "obj-645",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12488,
                    160,
                    22
                  ],
                  "text": "prepend accidental"
                }
              },
              {
                "box": {
                  "id": "obj-646",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12524,
                    160,
                    22
                  ],
                  "text": "prepend at"
                }
              },
              {
                "box": {
                  "id": "obj-647",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12560,
                    160,
                    22
                  ],
                  "text": "prepend duration"
                }
              },
              {
                "box": {
                  "id": "obj-648",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12596,
                    160,
                    22
                  ],
                  "text": "prepend gate"
                }
              },
              {
                "box": {
                  "id": "obj-649",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    12632,
                    160,
                    22
                  ],
                  "text": "prepend velocity"
                }
              },
              {
                "box": {
                  "id": "obj-650",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    12416,
                    160,
                    22
                  ],
                  "text": "prepend remove_note 15"
                }
              },
              {
                "box": {
                  "id": "obj-651",
                  "maxclass": "message",
                  "patching_rect": [
                    240,
                    12812,
                    100,
                    22
                  ],
                  "text": "add_note"
                }
              },
              {
                "box": {
                  "id": "obj-652",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1256,
                    160,
                    22
                  ],
                  "text": "prepend filter_motifs"
                }
              },
              {
                "box": {
                  "id": "obj-653",
                  "maxclass": "message",
                  "patching_rect": [
                    220,
                    1256,
                    100,
                    22
                  ],
                  "text": "filter_motifs"
                }
              },
              {
                "box": {
                  "id": "obj-654",
                  "maxclass": "message",
                  "patching_rect": [
                    360,
                    1256,
                    50,
                    22
                  ],
                  "text": "set"
                }
              },
              {
                "box": {
                  "id": "obj-655",
                  "maxclass": "newobj",
                  "patching_rect": [
                    440,
                    1256,
                    60,
                    22
                  ],
                  "text": "t b b"
                }
              },
              {
                "box": {
                  "id": "obj-656",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1292,
                    170,
                    22
                  ],
                  "text": "prepend select_browser"
                }
              },
              {
                "box": {
                  "id": "obj-657",
                  "maxclass": "message",
                  "patching_rect": [
                    20,
                    1328,
                    100,
                    22
                  ],
                  "text": "import_clip"
                }
              },
              {
                "box": {
                  "id": "obj-658",
                  "maxclass": "message",
                  "patching_rect": [
                    20,
                    1364,
                    100,
                    22
                  ],
                  "text": "save_motif"
                }
              },
              {
                "box": {
                  "id": "obj-659",
                  "maxclass": "message",
                  "patching_rect": [
                    20,
                    1400,
                    100,
                    22
                  ],
                  "text": "begin_edit"
                }
              },
              {
                "box": {
                  "id": "obj-660",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    1400,
                    160,
                    22
                  ],
                  "text": "prepend edit_meta name"
                }
              },
              {
                "box": {
                  "id": "obj-661",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    1436,
                    190,
                    22
                  ],
                  "text": "prepend edit_meta description"
                }
              },
              {
                "box": {
                  "id": "obj-662",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20,
                    1472,
                    120,
                    22
                  ],
                  "text": "opendialog fold"
                }
              },
              {
                "box": {
                  "id": "obj-663",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    1472,
                    160,
                    22
                  ],
                  "text": "send ---library_path"
                }
              },
              {
                "box": {
                  "id": "obj-664",
                  "maxclass": "newobj",
                  "patching_rect": [
                    240,
                    1508,
                    170,
                    22
                  ],
                  "text": "send ---refresh_library"
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "obj-341",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-342",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-344",
                    0
                  ],
                  "destination": [
                    "obj-348",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-348",
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
                    "obj-345",
                    0
                  ],
                  "destination": [
                    "obj-349",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-349",
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
                    "obj-346",
                    0
                  ],
                  "destination": [
                    "obj-350",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-350",
                    0
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
                    "obj-347",
                    0
                  ],
                  "destination": [
                    "obj-351",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-351",
                    0
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
                    "obj-352",
                    0
                  ],
                  "destination": [
                    "obj-355",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-355",
                    0
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
                    "obj-353",
                    0
                  ],
                  "destination": [
                    "obj-356",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-356",
                    1
                  ],
                  "destination": [
                    "obj-357",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-357",
                    0
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
                    "obj-354",
                    0
                  ],
                  "destination": [
                    "obj-358",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-358",
                    0
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
                    "obj-359",
                    0
                  ],
                  "destination": [
                    "obj-360",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-361",
                    0
                  ],
                  "destination": [
                    "obj-362",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    0
                  ],
                  "destination": [
                    "obj-363",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-363",
                    0
                  ],
                  "destination": [
                    "obj-364",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-363",
                    1
                  ],
                  "destination": [
                    "obj-365",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-364",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-365",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    0
                  ],
                  "destination": [
                    "obj-366",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-366",
                    0
                  ],
                  "destination": [
                    "obj-367",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-367",
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
                    "obj-366",
                    1
                  ],
                  "destination": [
                    "obj-368",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-368",
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
                    "obj-366",
                    2
                  ],
                  "destination": [
                    "obj-369",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-369",
                    0
                  ],
                  "destination": [
                    "obj-214",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-366",
                    3
                  ],
                  "destination": [
                    "obj-370",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-370",
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
                    "obj-366",
                    4
                  ],
                  "destination": [
                    "obj-371",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-371",
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
                    "obj-366",
                    5
                  ],
                  "destination": [
                    "obj-372",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-372",
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
                    "obj-373",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-374",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-374",
                    0
                  ],
                  "destination": [
                    "obj-373",
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
                    "obj-375",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-375",
                    0
                  ],
                  "destination": [
                    "obj-373",
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
                    "obj-376",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-376",
                    0
                  ],
                  "destination": [
                    "obj-373",
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
                    "obj-377",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-377",
                    0
                  ],
                  "destination": [
                    "obj-373",
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
                    "obj-378",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-378",
                    0
                  ],
                  "destination": [
                    "obj-373",
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
                    "obj-379",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-379",
                    0
                  ],
                  "destination": [
                    "obj-373",
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
                    "obj-380",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-380",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    1
                  ],
                  "destination": [
                    "obj-381",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-381",
                    0
                  ],
                  "destination": [
                    "obj-382",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-381",
                    1
                  ],
                  "destination": [
                    "obj-383",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-382",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-383",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    1
                  ],
                  "destination": [
                    "obj-384",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-384",
                    0
                  ],
                  "destination": [
                    "obj-385",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-385",
                    0
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
                    "obj-384",
                    1
                  ],
                  "destination": [
                    "obj-386",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-386",
                    0
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
                    "obj-384",
                    2
                  ],
                  "destination": [
                    "obj-387",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-387",
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
                    "obj-384",
                    3
                  ],
                  "destination": [
                    "obj-388",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-388",
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
                    "obj-384",
                    4
                  ],
                  "destination": [
                    "obj-389",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-389",
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
                    "obj-384",
                    5
                  ],
                  "destination": [
                    "obj-390",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-390",
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
                    "obj-391",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-392",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-392",
                    0
                  ],
                  "destination": [
                    "obj-391",
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
                    "obj-393",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-393",
                    0
                  ],
                  "destination": [
                    "obj-391",
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
                    "obj-394",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-394",
                    0
                  ],
                  "destination": [
                    "obj-391",
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
                    "obj-395",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-395",
                    0
                  ],
                  "destination": [
                    "obj-391",
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
                    "obj-396",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-396",
                    0
                  ],
                  "destination": [
                    "obj-391",
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
                    "obj-397",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-397",
                    0
                  ],
                  "destination": [
                    "obj-391",
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
                    "obj-398",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-398",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    2
                  ],
                  "destination": [
                    "obj-399",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-399",
                    0
                  ],
                  "destination": [
                    "obj-400",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-399",
                    1
                  ],
                  "destination": [
                    "obj-401",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-400",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-401",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    2
                  ],
                  "destination": [
                    "obj-402",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-402",
                    0
                  ],
                  "destination": [
                    "obj-403",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-403",
                    0
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
                    "obj-402",
                    1
                  ],
                  "destination": [
                    "obj-404",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-404",
                    0
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
                    "obj-402",
                    2
                  ],
                  "destination": [
                    "obj-405",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-405",
                    0
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
                    "obj-402",
                    3
                  ],
                  "destination": [
                    "obj-406",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-406",
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
                    "obj-402",
                    4
                  ],
                  "destination": [
                    "obj-407",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-407",
                    0
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
                    "obj-402",
                    5
                  ],
                  "destination": [
                    "obj-408",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-408",
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
                    "obj-409",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-410",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-410",
                    0
                  ],
                  "destination": [
                    "obj-409",
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
                    "obj-411",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-411",
                    0
                  ],
                  "destination": [
                    "obj-409",
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
                    "obj-412",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-412",
                    0
                  ],
                  "destination": [
                    "obj-409",
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
                    "obj-413",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-413",
                    0
                  ],
                  "destination": [
                    "obj-409",
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
                    "obj-414",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-414",
                    0
                  ],
                  "destination": [
                    "obj-409",
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
                    "obj-415",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-415",
                    0
                  ],
                  "destination": [
                    "obj-409",
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
                    "obj-416",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-416",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    3
                  ],
                  "destination": [
                    "obj-417",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-417",
                    0
                  ],
                  "destination": [
                    "obj-418",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-417",
                    1
                  ],
                  "destination": [
                    "obj-419",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-418",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-419",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    3
                  ],
                  "destination": [
                    "obj-420",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-420",
                    0
                  ],
                  "destination": [
                    "obj-421",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-421",
                    0
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
                    "obj-420",
                    1
                  ],
                  "destination": [
                    "obj-422",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-422",
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
                    "obj-420",
                    2
                  ],
                  "destination": [
                    "obj-423",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-423",
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
                    "obj-420",
                    3
                  ],
                  "destination": [
                    "obj-424",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-424",
                    0
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
                    "obj-420",
                    4
                  ],
                  "destination": [
                    "obj-425",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-425",
                    0
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
                    "obj-420",
                    5
                  ],
                  "destination": [
                    "obj-426",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-426",
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
                    "obj-427",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-428",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-428",
                    0
                  ],
                  "destination": [
                    "obj-427",
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
                    "obj-429",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-429",
                    0
                  ],
                  "destination": [
                    "obj-427",
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
                    "obj-430",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-430",
                    0
                  ],
                  "destination": [
                    "obj-427",
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
                    "obj-431",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-431",
                    0
                  ],
                  "destination": [
                    "obj-427",
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
                    "obj-432",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-432",
                    0
                  ],
                  "destination": [
                    "obj-427",
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
                    "obj-433",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-433",
                    0
                  ],
                  "destination": [
                    "obj-427",
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
                    "obj-434",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-434",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    4
                  ],
                  "destination": [
                    "obj-435",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-435",
                    0
                  ],
                  "destination": [
                    "obj-436",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-435",
                    1
                  ],
                  "destination": [
                    "obj-437",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-436",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-437",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    4
                  ],
                  "destination": [
                    "obj-438",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-438",
                    0
                  ],
                  "destination": [
                    "obj-439",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-439",
                    0
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
                    "obj-438",
                    1
                  ],
                  "destination": [
                    "obj-440",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-440",
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
                    "obj-438",
                    2
                  ],
                  "destination": [
                    "obj-441",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-441",
                    0
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
                    "obj-438",
                    3
                  ],
                  "destination": [
                    "obj-442",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-442",
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
                    "obj-438",
                    4
                  ],
                  "destination": [
                    "obj-443",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-443",
                    0
                  ],
                  "destination": [
                    "obj-248",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-438",
                    5
                  ],
                  "destination": [
                    "obj-444",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-444",
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
                    "obj-445",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-446",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-446",
                    0
                  ],
                  "destination": [
                    "obj-445",
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
                    "obj-447",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-447",
                    0
                  ],
                  "destination": [
                    "obj-445",
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
                    "obj-448",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-448",
                    0
                  ],
                  "destination": [
                    "obj-445",
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
                    "obj-449",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-449",
                    0
                  ],
                  "destination": [
                    "obj-445",
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
                    "obj-450",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-450",
                    0
                  ],
                  "destination": [
                    "obj-445",
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
                    "obj-451",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-451",
                    0
                  ],
                  "destination": [
                    "obj-445",
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
                    "obj-452",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-452",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    5
                  ],
                  "destination": [
                    "obj-453",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-453",
                    0
                  ],
                  "destination": [
                    "obj-454",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-453",
                    1
                  ],
                  "destination": [
                    "obj-455",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-454",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-455",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    5
                  ],
                  "destination": [
                    "obj-456",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-456",
                    0
                  ],
                  "destination": [
                    "obj-457",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-457",
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
                    "obj-456",
                    1
                  ],
                  "destination": [
                    "obj-458",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-458",
                    0
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
                    "obj-456",
                    2
                  ],
                  "destination": [
                    "obj-459",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-459",
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
                    "obj-456",
                    3
                  ],
                  "destination": [
                    "obj-460",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-460",
                    0
                  ],
                  "destination": [
                    "obj-255",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-456",
                    4
                  ],
                  "destination": [
                    "obj-461",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-461",
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
                    "obj-456",
                    5
                  ],
                  "destination": [
                    "obj-462",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-462",
                    0
                  ],
                  "destination": [
                    "obj-257",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-463",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-464",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-464",
                    0
                  ],
                  "destination": [
                    "obj-463",
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
                    "obj-465",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-465",
                    0
                  ],
                  "destination": [
                    "obj-463",
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
                    "obj-466",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-466",
                    0
                  ],
                  "destination": [
                    "obj-463",
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
                    "obj-467",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-467",
                    0
                  ],
                  "destination": [
                    "obj-463",
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
                    "obj-468",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-468",
                    0
                  ],
                  "destination": [
                    "obj-463",
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
                    "obj-469",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-469",
                    0
                  ],
                  "destination": [
                    "obj-463",
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
                    "obj-470",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-470",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    6
                  ],
                  "destination": [
                    "obj-471",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-471",
                    0
                  ],
                  "destination": [
                    "obj-472",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-471",
                    1
                  ],
                  "destination": [
                    "obj-473",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-472",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-473",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    6
                  ],
                  "destination": [
                    "obj-474",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-474",
                    0
                  ],
                  "destination": [
                    "obj-475",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-475",
                    0
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
                    "obj-474",
                    1
                  ],
                  "destination": [
                    "obj-476",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-476",
                    0
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
                    "obj-474",
                    2
                  ],
                  "destination": [
                    "obj-477",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-477",
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
                    "obj-474",
                    3
                  ],
                  "destination": [
                    "obj-478",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-478",
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
                    "obj-474",
                    4
                  ],
                  "destination": [
                    "obj-479",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-479",
                    0
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
                    "obj-474",
                    5
                  ],
                  "destination": [
                    "obj-480",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-480",
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
                    "obj-481",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-482",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-482",
                    0
                  ],
                  "destination": [
                    "obj-481",
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
                    "obj-483",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-483",
                    0
                  ],
                  "destination": [
                    "obj-481",
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
                    "obj-484",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-484",
                    0
                  ],
                  "destination": [
                    "obj-481",
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
                    "obj-485",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-485",
                    0
                  ],
                  "destination": [
                    "obj-481",
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
                    "obj-486",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-486",
                    0
                  ],
                  "destination": [
                    "obj-481",
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
                    "obj-487",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-487",
                    0
                  ],
                  "destination": [
                    "obj-481",
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
                    "obj-488",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-488",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    7
                  ],
                  "destination": [
                    "obj-489",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-489",
                    0
                  ],
                  "destination": [
                    "obj-490",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-489",
                    1
                  ],
                  "destination": [
                    "obj-491",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-490",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-491",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    7
                  ],
                  "destination": [
                    "obj-492",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-492",
                    0
                  ],
                  "destination": [
                    "obj-493",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-493",
                    0
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
                    "obj-492",
                    1
                  ],
                  "destination": [
                    "obj-494",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-494",
                    0
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
                    "obj-492",
                    2
                  ],
                  "destination": [
                    "obj-495",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-495",
                    0
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
                    "obj-492",
                    3
                  ],
                  "destination": [
                    "obj-496",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-496",
                    0
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
                    "obj-492",
                    4
                  ],
                  "destination": [
                    "obj-497",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-497",
                    0
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
                    "obj-492",
                    5
                  ],
                  "destination": [
                    "obj-498",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-498",
                    0
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
                    "obj-499",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-500",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-500",
                    0
                  ],
                  "destination": [
                    "obj-499",
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
                    "obj-501",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-501",
                    0
                  ],
                  "destination": [
                    "obj-499",
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
                    "obj-502",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-502",
                    0
                  ],
                  "destination": [
                    "obj-499",
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
                    "obj-503",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-503",
                    0
                  ],
                  "destination": [
                    "obj-499",
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
                    "obj-504",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-504",
                    0
                  ],
                  "destination": [
                    "obj-499",
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
                    "obj-505",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-505",
                    0
                  ],
                  "destination": [
                    "obj-499",
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
                    "obj-506",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-506",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    8
                  ],
                  "destination": [
                    "obj-507",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-507",
                    0
                  ],
                  "destination": [
                    "obj-508",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-507",
                    1
                  ],
                  "destination": [
                    "obj-509",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-508",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-509",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    8
                  ],
                  "destination": [
                    "obj-510",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-510",
                    0
                  ],
                  "destination": [
                    "obj-511",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-511",
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
                    "obj-510",
                    1
                  ],
                  "destination": [
                    "obj-512",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-512",
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
                    "obj-510",
                    2
                  ],
                  "destination": [
                    "obj-513",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-513",
                    0
                  ],
                  "destination": [
                    "obj-278",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-510",
                    3
                  ],
                  "destination": [
                    "obj-514",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-514",
                    0
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
                    "obj-510",
                    4
                  ],
                  "destination": [
                    "obj-515",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-515",
                    0
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
                    "obj-510",
                    5
                  ],
                  "destination": [
                    "obj-516",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-516",
                    0
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
                    "obj-517",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-518",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-518",
                    0
                  ],
                  "destination": [
                    "obj-517",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-277",
                    0
                  ],
                  "destination": [
                    "obj-519",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-519",
                    0
                  ],
                  "destination": [
                    "obj-517",
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
                    "obj-520",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-520",
                    0
                  ],
                  "destination": [
                    "obj-517",
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
                    "obj-521",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-521",
                    0
                  ],
                  "destination": [
                    "obj-517",
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
                    "obj-522",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-522",
                    0
                  ],
                  "destination": [
                    "obj-517",
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
                    "obj-523",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-523",
                    0
                  ],
                  "destination": [
                    "obj-517",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-282",
                    0
                  ],
                  "destination": [
                    "obj-524",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-524",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    9
                  ],
                  "destination": [
                    "obj-525",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-525",
                    0
                  ],
                  "destination": [
                    "obj-526",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-525",
                    1
                  ],
                  "destination": [
                    "obj-527",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-526",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-527",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    9
                  ],
                  "destination": [
                    "obj-528",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-528",
                    0
                  ],
                  "destination": [
                    "obj-529",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-529",
                    0
                  ],
                  "destination": [
                    "obj-284",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-528",
                    1
                  ],
                  "destination": [
                    "obj-530",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-530",
                    0
                  ],
                  "destination": [
                    "obj-285",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-528",
                    2
                  ],
                  "destination": [
                    "obj-531",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-531",
                    0
                  ],
                  "destination": [
                    "obj-286",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-528",
                    3
                  ],
                  "destination": [
                    "obj-532",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-532",
                    0
                  ],
                  "destination": [
                    "obj-287",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-528",
                    4
                  ],
                  "destination": [
                    "obj-533",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-533",
                    0
                  ],
                  "destination": [
                    "obj-288",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-528",
                    5
                  ],
                  "destination": [
                    "obj-534",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-534",
                    0
                  ],
                  "destination": [
                    "obj-289",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-535",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-284",
                    0
                  ],
                  "destination": [
                    "obj-536",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-536",
                    0
                  ],
                  "destination": [
                    "obj-535",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-285",
                    0
                  ],
                  "destination": [
                    "obj-537",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-537",
                    0
                  ],
                  "destination": [
                    "obj-535",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-286",
                    0
                  ],
                  "destination": [
                    "obj-538",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-538",
                    0
                  ],
                  "destination": [
                    "obj-535",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-287",
                    0
                  ],
                  "destination": [
                    "obj-539",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-539",
                    0
                  ],
                  "destination": [
                    "obj-535",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-288",
                    0
                  ],
                  "destination": [
                    "obj-540",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-540",
                    0
                  ],
                  "destination": [
                    "obj-535",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-289",
                    0
                  ],
                  "destination": [
                    "obj-541",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-541",
                    0
                  ],
                  "destination": [
                    "obj-535",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-290",
                    0
                  ],
                  "destination": [
                    "obj-542",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-542",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    10
                  ],
                  "destination": [
                    "obj-543",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-543",
                    0
                  ],
                  "destination": [
                    "obj-544",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-543",
                    1
                  ],
                  "destination": [
                    "obj-545",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-544",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-545",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    10
                  ],
                  "destination": [
                    "obj-546",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-546",
                    0
                  ],
                  "destination": [
                    "obj-547",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-547",
                    0
                  ],
                  "destination": [
                    "obj-292",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-546",
                    1
                  ],
                  "destination": [
                    "obj-548",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-548",
                    0
                  ],
                  "destination": [
                    "obj-293",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-546",
                    2
                  ],
                  "destination": [
                    "obj-549",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-549",
                    0
                  ],
                  "destination": [
                    "obj-294",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-546",
                    3
                  ],
                  "destination": [
                    "obj-550",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-550",
                    0
                  ],
                  "destination": [
                    "obj-295",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-546",
                    4
                  ],
                  "destination": [
                    "obj-551",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-551",
                    0
                  ],
                  "destination": [
                    "obj-296",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-546",
                    5
                  ],
                  "destination": [
                    "obj-552",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-552",
                    0
                  ],
                  "destination": [
                    "obj-297",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-553",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-292",
                    0
                  ],
                  "destination": [
                    "obj-554",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-554",
                    0
                  ],
                  "destination": [
                    "obj-553",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-293",
                    0
                  ],
                  "destination": [
                    "obj-555",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-555",
                    0
                  ],
                  "destination": [
                    "obj-553",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-294",
                    0
                  ],
                  "destination": [
                    "obj-556",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-556",
                    0
                  ],
                  "destination": [
                    "obj-553",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-295",
                    0
                  ],
                  "destination": [
                    "obj-557",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-557",
                    0
                  ],
                  "destination": [
                    "obj-553",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-296",
                    0
                  ],
                  "destination": [
                    "obj-558",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-558",
                    0
                  ],
                  "destination": [
                    "obj-553",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-297",
                    0
                  ],
                  "destination": [
                    "obj-559",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-559",
                    0
                  ],
                  "destination": [
                    "obj-553",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-298",
                    0
                  ],
                  "destination": [
                    "obj-560",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-560",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    11
                  ],
                  "destination": [
                    "obj-561",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-561",
                    0
                  ],
                  "destination": [
                    "obj-562",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-561",
                    1
                  ],
                  "destination": [
                    "obj-563",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-562",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-563",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    11
                  ],
                  "destination": [
                    "obj-564",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-564",
                    0
                  ],
                  "destination": [
                    "obj-565",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-565",
                    0
                  ],
                  "destination": [
                    "obj-300",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-564",
                    1
                  ],
                  "destination": [
                    "obj-566",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-566",
                    0
                  ],
                  "destination": [
                    "obj-301",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-564",
                    2
                  ],
                  "destination": [
                    "obj-567",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-567",
                    0
                  ],
                  "destination": [
                    "obj-302",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-564",
                    3
                  ],
                  "destination": [
                    "obj-568",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-568",
                    0
                  ],
                  "destination": [
                    "obj-303",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-564",
                    4
                  ],
                  "destination": [
                    "obj-569",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-569",
                    0
                  ],
                  "destination": [
                    "obj-304",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-564",
                    5
                  ],
                  "destination": [
                    "obj-570",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-570",
                    0
                  ],
                  "destination": [
                    "obj-305",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-571",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-300",
                    0
                  ],
                  "destination": [
                    "obj-572",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-572",
                    0
                  ],
                  "destination": [
                    "obj-571",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-301",
                    0
                  ],
                  "destination": [
                    "obj-573",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-573",
                    0
                  ],
                  "destination": [
                    "obj-571",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-302",
                    0
                  ],
                  "destination": [
                    "obj-574",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-574",
                    0
                  ],
                  "destination": [
                    "obj-571",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-303",
                    0
                  ],
                  "destination": [
                    "obj-575",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-575",
                    0
                  ],
                  "destination": [
                    "obj-571",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-304",
                    0
                  ],
                  "destination": [
                    "obj-576",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-576",
                    0
                  ],
                  "destination": [
                    "obj-571",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-305",
                    0
                  ],
                  "destination": [
                    "obj-577",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-577",
                    0
                  ],
                  "destination": [
                    "obj-571",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-306",
                    0
                  ],
                  "destination": [
                    "obj-578",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-578",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    12
                  ],
                  "destination": [
                    "obj-579",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-579",
                    0
                  ],
                  "destination": [
                    "obj-580",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-579",
                    1
                  ],
                  "destination": [
                    "obj-581",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-580",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-581",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    12
                  ],
                  "destination": [
                    "obj-582",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-582",
                    0
                  ],
                  "destination": [
                    "obj-583",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-583",
                    0
                  ],
                  "destination": [
                    "obj-308",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-582",
                    1
                  ],
                  "destination": [
                    "obj-584",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-584",
                    0
                  ],
                  "destination": [
                    "obj-309",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-582",
                    2
                  ],
                  "destination": [
                    "obj-585",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-585",
                    0
                  ],
                  "destination": [
                    "obj-310",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-582",
                    3
                  ],
                  "destination": [
                    "obj-586",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-586",
                    0
                  ],
                  "destination": [
                    "obj-311",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-582",
                    4
                  ],
                  "destination": [
                    "obj-587",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-587",
                    0
                  ],
                  "destination": [
                    "obj-312",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-582",
                    5
                  ],
                  "destination": [
                    "obj-588",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-588",
                    0
                  ],
                  "destination": [
                    "obj-313",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-589",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-308",
                    0
                  ],
                  "destination": [
                    "obj-590",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-590",
                    0
                  ],
                  "destination": [
                    "obj-589",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-309",
                    0
                  ],
                  "destination": [
                    "obj-591",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-591",
                    0
                  ],
                  "destination": [
                    "obj-589",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-310",
                    0
                  ],
                  "destination": [
                    "obj-592",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-592",
                    0
                  ],
                  "destination": [
                    "obj-589",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-311",
                    0
                  ],
                  "destination": [
                    "obj-593",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-593",
                    0
                  ],
                  "destination": [
                    "obj-589",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-312",
                    0
                  ],
                  "destination": [
                    "obj-594",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-594",
                    0
                  ],
                  "destination": [
                    "obj-589",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-313",
                    0
                  ],
                  "destination": [
                    "obj-595",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-595",
                    0
                  ],
                  "destination": [
                    "obj-589",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-314",
                    0
                  ],
                  "destination": [
                    "obj-596",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-596",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    13
                  ],
                  "destination": [
                    "obj-597",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-597",
                    0
                  ],
                  "destination": [
                    "obj-598",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-597",
                    1
                  ],
                  "destination": [
                    "obj-599",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-598",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-599",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    13
                  ],
                  "destination": [
                    "obj-600",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-600",
                    0
                  ],
                  "destination": [
                    "obj-601",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-601",
                    0
                  ],
                  "destination": [
                    "obj-316",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-600",
                    1
                  ],
                  "destination": [
                    "obj-602",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-602",
                    0
                  ],
                  "destination": [
                    "obj-317",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-600",
                    2
                  ],
                  "destination": [
                    "obj-603",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-603",
                    0
                  ],
                  "destination": [
                    "obj-318",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-600",
                    3
                  ],
                  "destination": [
                    "obj-604",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-604",
                    0
                  ],
                  "destination": [
                    "obj-319",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-600",
                    4
                  ],
                  "destination": [
                    "obj-605",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-605",
                    0
                  ],
                  "destination": [
                    "obj-320",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-600",
                    5
                  ],
                  "destination": [
                    "obj-606",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-606",
                    0
                  ],
                  "destination": [
                    "obj-321",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-607",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-316",
                    0
                  ],
                  "destination": [
                    "obj-608",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-608",
                    0
                  ],
                  "destination": [
                    "obj-607",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-317",
                    0
                  ],
                  "destination": [
                    "obj-609",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-609",
                    0
                  ],
                  "destination": [
                    "obj-607",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-318",
                    0
                  ],
                  "destination": [
                    "obj-610",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-610",
                    0
                  ],
                  "destination": [
                    "obj-607",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-319",
                    0
                  ],
                  "destination": [
                    "obj-611",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-611",
                    0
                  ],
                  "destination": [
                    "obj-607",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-320",
                    0
                  ],
                  "destination": [
                    "obj-612",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-612",
                    0
                  ],
                  "destination": [
                    "obj-607",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-321",
                    0
                  ],
                  "destination": [
                    "obj-613",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-613",
                    0
                  ],
                  "destination": [
                    "obj-607",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-322",
                    0
                  ],
                  "destination": [
                    "obj-614",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-614",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    14
                  ],
                  "destination": [
                    "obj-615",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-615",
                    0
                  ],
                  "destination": [
                    "obj-616",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-615",
                    1
                  ],
                  "destination": [
                    "obj-617",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-616",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-617",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    14
                  ],
                  "destination": [
                    "obj-618",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-618",
                    0
                  ],
                  "destination": [
                    "obj-619",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-619",
                    0
                  ],
                  "destination": [
                    "obj-324",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-618",
                    1
                  ],
                  "destination": [
                    "obj-620",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-620",
                    0
                  ],
                  "destination": [
                    "obj-325",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-618",
                    2
                  ],
                  "destination": [
                    "obj-621",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-621",
                    0
                  ],
                  "destination": [
                    "obj-326",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-618",
                    3
                  ],
                  "destination": [
                    "obj-622",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-622",
                    0
                  ],
                  "destination": [
                    "obj-327",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-618",
                    4
                  ],
                  "destination": [
                    "obj-623",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-623",
                    0
                  ],
                  "destination": [
                    "obj-328",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-618",
                    5
                  ],
                  "destination": [
                    "obj-624",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-624",
                    0
                  ],
                  "destination": [
                    "obj-329",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-625",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-324",
                    0
                  ],
                  "destination": [
                    "obj-626",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-626",
                    0
                  ],
                  "destination": [
                    "obj-625",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-325",
                    0
                  ],
                  "destination": [
                    "obj-627",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-627",
                    0
                  ],
                  "destination": [
                    "obj-625",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-326",
                    0
                  ],
                  "destination": [
                    "obj-628",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-628",
                    0
                  ],
                  "destination": [
                    "obj-625",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-327",
                    0
                  ],
                  "destination": [
                    "obj-629",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-629",
                    0
                  ],
                  "destination": [
                    "obj-625",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-328",
                    0
                  ],
                  "destination": [
                    "obj-630",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-630",
                    0
                  ],
                  "destination": [
                    "obj-625",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-329",
                    0
                  ],
                  "destination": [
                    "obj-631",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-631",
                    0
                  ],
                  "destination": [
                    "obj-625",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-330",
                    0
                  ],
                  "destination": [
                    "obj-632",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-632",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-360",
                    15
                  ],
                  "destination": [
                    "obj-633",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-633",
                    0
                  ],
                  "destination": [
                    "obj-634",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-633",
                    1
                  ],
                  "destination": [
                    "obj-635",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-634",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-635",
                    0
                  ],
                  "destination": [
                    "obj-340",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-362",
                    15
                  ],
                  "destination": [
                    "obj-636",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-636",
                    0
                  ],
                  "destination": [
                    "obj-637",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-637",
                    0
                  ],
                  "destination": [
                    "obj-332",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-636",
                    1
                  ],
                  "destination": [
                    "obj-638",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-638",
                    0
                  ],
                  "destination": [
                    "obj-333",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-636",
                    2
                  ],
                  "destination": [
                    "obj-639",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-639",
                    0
                  ],
                  "destination": [
                    "obj-334",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-636",
                    3
                  ],
                  "destination": [
                    "obj-640",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-640",
                    0
                  ],
                  "destination": [
                    "obj-335",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-636",
                    4
                  ],
                  "destination": [
                    "obj-641",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-641",
                    0
                  ],
                  "destination": [
                    "obj-336",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-636",
                    5
                  ],
                  "destination": [
                    "obj-642",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-642",
                    0
                  ],
                  "destination": [
                    "obj-337",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-643",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-332",
                    0
                  ],
                  "destination": [
                    "obj-644",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-644",
                    0
                  ],
                  "destination": [
                    "obj-643",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-333",
                    0
                  ],
                  "destination": [
                    "obj-645",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-645",
                    0
                  ],
                  "destination": [
                    "obj-643",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-334",
                    0
                  ],
                  "destination": [
                    "obj-646",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-646",
                    0
                  ],
                  "destination": [
                    "obj-643",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-335",
                    0
                  ],
                  "destination": [
                    "obj-647",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-647",
                    0
                  ],
                  "destination": [
                    "obj-643",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-336",
                    0
                  ],
                  "destination": [
                    "obj-648",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-648",
                    0
                  ],
                  "destination": [
                    "obj-643",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-337",
                    0
                  ],
                  "destination": [
                    "obj-649",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-649",
                    0
                  ],
                  "destination": [
                    "obj-643",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-338",
                    0
                  ],
                  "destination": [
                    "obj-650",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-650",
                    0
                  ],
                  "destination": [
                    "obj-343",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-339",
                    0
                  ],
                  "destination": [
                    "obj-651",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-651",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-652",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-652",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-655",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-655",
                    0
                  ],
                  "destination": [
                    "obj-653",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-655",
                    1
                  ],
                  "destination": [
                    "obj-654",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-654",
                    0
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
                    "obj-653",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-656",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-656",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-657",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-657",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-658",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-658",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-659",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-659",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-660",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-660",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-661",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-661",
                    0
                  ],
                  "destination": [
                    "obj-343",
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
                    "obj-662",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "obj-662",
                    0
                  ],
                  "destination": [
                    "obj-663",
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
                    "obj-664",
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
          "id": "obj-666",
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
          "id": "obj-667",
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
          "id": "obj-668",
          "maxclass": "message",
          "patching_rect": [
            2200,
            3200,
            140,
            22
          ],
          "text": "window flags float"
        }
      },
      {
        "box": {
          "id": "obj-669",
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
          "id": "obj-670",
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
          "id": "obj-671",
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
          "id": "obj-672",
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
          "id": "obj-673",
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
          "id": "obj-674",
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
          "id": "obj-675",
          "maxclass": "newobj",
          "patching_rect": [
            2680,
            3200,
            160,
            22
          ],
          "text": "prepend library_path"
        }
      },
      {
        "box": {
          "id": "obj-676",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3290,
            190,
            22
          ],
          "text": "receive ---refresh_library"
        }
      },
      {
        "box": {
          "id": "obj-677",
          "maxclass": "message",
          "patching_rect": [
            2700,
            3290,
            120,
            22
          ],
          "text": "refresh_library"
        }
      },
      {
        "box": {
          "id": "obj-678",
          "maxclass": "newobj",
          "patching_rect": [
            2420,
            3380,
            180,
            22
          ],
          "text": "receive ---motif_author"
        }
      },
      {
        "box": {
          "id": "obj-679",
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
          "id": "obj-680",
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
          "id": "obj-681",
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
          "id": "obj-682",
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
          "id": "obj-683",
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
          "id": "obj-684",
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
          "id": "obj-685",
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
          "id": "obj-686",
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
          "id": "obj-687",
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
          "id": "obj-688",
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
          "id": "obj-689",
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
          "id": "obj-690",
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
          "id": "obj-691",
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
          "id": "obj-692",
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
          "id": "obj-693",
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
          "id": "obj-694",
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
          "id": "obj-695",
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
          "id": "obj-696",
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
          "id": "obj-697",
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
          "id": "obj-698",
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
          "id": "obj-699",
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
          "id": "obj-700",
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
            "obj-73",
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
            "obj-85",
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
            "obj-85",
            1
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
            "obj-77",
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-89",
            1
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
            "obj-77",
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
            "obj-93",
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
            "obj-93",
            1
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
            "obj-77",
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-97",
            1
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
            "obj-77",
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-101",
            1
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
            "obj-77",
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-105",
            1
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
            "obj-77",
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-109",
            1
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
            "obj-77",
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-113",
            1
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
            "obj-115",
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
            "obj-73",
            8
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
            "obj-74",
            0
          ],
          "destination": [
            "obj-117",
            1
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
            "obj-119",
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
            "obj-89",
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
            "obj-13",
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
            "obj-14",
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
            "obj-123",
            0
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
            "obj-123",
            1
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
            0
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
            "obj-124",
            1
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
            "obj-126",
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
            "obj-127",
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
            "obj-125",
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
            "obj-125",
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
            "obj-128",
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
            "obj-129",
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
            2
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
            "obj-72",
            1
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
            "obj-72",
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
            "obj-44",
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
            "obj-44",
            0
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
            "obj-79",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-79",
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
            "obj-32",
            0
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
            "obj-85",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-80",
            1
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
            "obj-80",
            2
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
            "obj-80",
            3
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
            "obj-80",
            4
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
            "obj-80",
            5
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
            "obj-80",
            6
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
            "obj-80",
            7
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
            "obj-80",
            8
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
            "obj-83",
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
            "obj-1",
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
            "obj-132",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            1
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
            "obj-132",
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
            "obj-134",
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
            "obj-134",
            1
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            2
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            3
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            4
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            5
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            6
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            7
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            8
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            9
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            10
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            11
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            12
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            13
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            14
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            15
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            16
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            17
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            18
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            19
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            20
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            21
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            22
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            23
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            24
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-134",
            25
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
            "obj-82",
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            1
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            2
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            3
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            4
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            5
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            6
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            7
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            8
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            9
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            10
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            11
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            12
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            13
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            14
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            15
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            16
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            17
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            18
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            19
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            20
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            21
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            22
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            23
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            24
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
            "obj-82",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-161",
            25
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
            "obj-82",
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
            "obj-667",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-667",
            4
          ],
          "destination": [
            "obj-668",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-667",
            3
          ],
          "destination": [
            "obj-669",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-667",
            2
          ],
          "destination": [
            "obj-672",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-667",
            1
          ],
          "destination": [
            "obj-671",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-667",
            0
          ],
          "destination": [
            "obj-673",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-673",
            0
          ],
          "destination": [
            "obj-670",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-668",
            0
          ],
          "destination": [
            "obj-666",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-669",
            0
          ],
          "destination": [
            "obj-666",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-670",
            0
          ],
          "destination": [
            "obj-666",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-671",
            0
          ],
          "destination": [
            "obj-666",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-672",
            0
          ],
          "destination": [
            "obj-666",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-666",
            0
          ],
          "destination": [
            "obj-665",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-674",
            0
          ],
          "destination": [
            "obj-675",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-675",
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
            "obj-676",
            0
          ],
          "destination": [
            "obj-677",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-677",
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
            "obj-678",
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
            "obj-29",
            0
          ],
          "destination": [
            "obj-30",
            1
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
            "obj-30",
            0
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
            "obj-41",
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
            "obj-33",
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
            "obj-34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-33",
            7
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
            "obj-33",
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
            "obj-33",
            6
          ],
          "destination": [
            "obj-36",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            1
          ],
          "destination": [
            "obj-36",
            1
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
            "obj-44",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
            6
          ],
          "destination": [
            "obj-39",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
            2
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
            2
          ],
          "destination": [
            "obj-47",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-46",
            3
          ],
          "destination": [
            "obj-47",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-47",
            2
          ],
          "destination": [
            "obj-49",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-47",
            1
          ],
          "destination": [
            "obj-48",
            1
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
            "obj-49",
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
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-41",
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
            "obj-45",
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
            "obj-50",
            1
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
            "obj-50",
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
            "obj-45",
            2
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
            "obj-47",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-45",
            6
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
            "obj-45",
            7
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
            "obj-45",
            8
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
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-45",
            10
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
            "obj-57",
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
            "obj-56",
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
            "obj-56",
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
            "obj-59",
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
            "obj-56",
            3
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            5
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
            "obj-56",
            6
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
            "obj-56",
            7
          ],
          "destination": [
            "obj-63",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            8
          ],
          "destination": [
            "obj-64",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            9
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
            "obj-56",
            10
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
            "obj-56",
            11
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
            "obj-56",
            12
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
            "obj-56",
            13
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
            "obj-2",
            1
          ],
          "destination": [
            "obj-680",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-680",
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
            "obj-11",
            1
          ],
          "destination": [
            "obj-681",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-681",
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
            "obj-4",
            1
          ],
          "destination": [
            "obj-682",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-682",
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
            "obj-21",
            1
          ],
          "destination": [
            "obj-683",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-683",
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
            "obj-22",
            1
          ],
          "destination": [
            "obj-684",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-684",
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
            "obj-23",
            1
          ],
          "destination": [
            "obj-685",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-685",
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
            "obj-24",
            1
          ],
          "destination": [
            "obj-686",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-686",
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
            "obj-25",
            1
          ],
          "destination": [
            "obj-687",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-687",
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
            "obj-26",
            0
          ],
          "destination": [
            "obj-688",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-688",
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
            "obj-27",
            0
          ],
          "destination": [
            "obj-689",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-689",
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
            "obj-6",
            0
          ],
          "destination": [
            "obj-690",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-690",
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
            "obj-691",
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
            "obj-692",
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
            "obj-693",
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
            "obj-694",
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
            "obj-695",
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
            "obj-696",
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
            "obj-697",
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
            "obj-698",
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
            "obj-699",
            0
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
            "obj-700",
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
      }
    ],
    "autosave": 0
  }
}
