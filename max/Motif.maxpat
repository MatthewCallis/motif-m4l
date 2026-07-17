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
      80,
      80,
      1710,
      830
    ],
    "bglocked": 0,
    "openinpresentation": 1,
    "default_fontsize": 12,
    "default_fontface": 0,
    "default_fontname": "Arial",
    "gridonopen": 1,
    "gridsize": [
      10,
      10
    ],
    "gridsnaponopen": 1,
    "objectsnaponopen": 1,
    "statusbarvisible": 2,
    "toolbarvisible": 1,
    "devicewidth": 820,
    "description": "Scale-aware triggerable motif engine with native Live Song synchronization and visual note preview",
    "digest": "Native Song observers for tempo and scale; fail-open MIDI routing; TypeScript motif processing; native multislider preview",
    "tags": "midi motif phrase scale preview",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "panel",
          "patching_rect": [
            0,
            0,
            820,
            169
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            0.34,
            0.34,
            0.35,
            1
          ],
          "rounded": 0,
          "presentation": 1,
          "presentation_rect": [
            0,
            0,
            820,
            169
          ]
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "panel",
          "patching_rect": [
            3,
            3,
            814,
            25
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            0.22,
            0.22,
            0.23,
            1
          ],
          "rounded": 5,
          "presentation": 1,
          "presentation_rect": [
            3,
            3,
            814,
            25
          ]
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "panel",
          "patching_rect": [
            3,
            27,
            814,
            1
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "rounded": 0,
          "presentation": 1,
          "presentation_rect": [
            3,
            27,
            814,
            1
          ]
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "panel",
          "patching_rect": [
            8,
            33,
            500,
            76
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            0.055,
            0.058,
            0.062,
            1
          ],
          "rounded": 6,
          "presentation": 1,
          "presentation_rect": [
            8,
            33,
            500,
            76
          ]
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "panel",
          "patching_rect": [
            514,
            33,
            298,
            76
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            0.055,
            0.058,
            0.062,
            1
          ],
          "rounded": 6,
          "presentation": 1,
          "presentation_rect": [
            514,
            33,
            298,
            76
          ]
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "panel",
          "patching_rect": [
            8,
            114,
            804,
            48
          ],
          "background": 1,
          "border": 0,
          "bgcolor": [
            0.055,
            0.058,
            0.062,
            1
          ],
          "rounded": 6,
          "presentation": 1,
          "presentation_rect": [
            8,
            114,
            804,
            48
          ]
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "comment",
          "patching_rect": [
            14,
            5,
            58,
            18
          ],
          "text": "MOTIF",
          "fontsize": 13,
          "fontface": 1,
          "textcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            14,
            5,
            58,
            18
          ],
          "varname": "title",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "comment",
          "patching_rect": [
            74,
            7,
            142,
            15
          ],
          "text": "scale-aware phrase trigger",
          "fontsize": 8,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            74,
            7,
            142,
            15
          ],
          "varname": "subtitle",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "comment",
          "patching_rect": [
            348,
            6,
            34,
            16
          ],
          "text": "C",
          "fontsize": 9,
          "fontface": 1,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 1,
          "presentation": 1,
          "presentation_rect": [
            348,
            6,
            34,
            16
          ],
          "varname": "root-display",
          "ignoreclick": 1,
          "annotation_name": "Live Scale Root",
          "annotation": "Live Set's current scale root, observed directly from Song.root_note.",
          "hint": "Live Set's current scale root, observed directly from Song.root_note."
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "comment",
          "patching_rect": [
            386,
            6,
            90,
            16
          ],
          "text": "Major",
          "fontsize": 9,
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
            386,
            6,
            90,
            16
          ],
          "varname": "scale-name-display",
          "ignoreclick": 1,
          "annotation_name": "Live Scale Name",
          "annotation": "Live Set's current scale name, observed directly from Song.scale_name.",
          "hint": "Live Set's current scale name, observed directly from Song.scale_name."
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "comment",
          "patching_rect": [
            477,
            7,
            50,
            14
          ],
          "text": "Scale On",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.43,
            0.82,
            0.49,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            477,
            7,
            50,
            14
          ],
          "varname": "scale-mode-display",
          "ignoreclick": 1,
          "annotation_name": "Live Scale Mode",
          "annotation": "Whether Live's Scale Mode is active, observed from Song.scale_mode.",
          "hint": "Whether Live's Scale Mode is active, observed from Song.scale_mode."
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "comment",
          "patching_rect": [
            536,
            6,
            44,
            16
          ],
          "text": "120",
          "fontsize": 9,
          "fontface": 1,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 2,
          "presentation": 1,
          "presentation_rect": [
            536,
            6,
            44,
            16
          ],
          "varname": "tempo-display",
          "ignoreclick": 1,
          "annotation_name": "Live Tempo",
          "annotation": "Current Live Set tempo in BPM, observed directly from Song.tempo. Motif timing follows this value on each trigger.",
          "hint": "Current Live Set tempo in BPM, observed directly from Song.tempo. Motif timing follows this value on each trigger."
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "comment",
          "patching_rect": [
            581,
            7,
            25,
            14
          ],
          "text": "BPM",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            581,
            7,
            25,
            14
          ],
          "varname": "tempo-unit",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "comment",
          "patching_rect": [
            610,
            6,
            34,
            16
          ],
          "text": "4/4",
          "fontsize": 9,
          "fontface": 1,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 1,
          "presentation": 1,
          "presentation_rect": [
            610,
            6,
            34,
            16
          ],
          "varname": "meter-display",
          "ignoreclick": 1,
          "annotation_name": "Live Meter",
          "annotation": "Current Live Set time signature from Song.signature_numerator and Song.signature_denominator.",
          "hint": "Current Live Set time signature from Song.signature_numerator and Song.signature_denominator."
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "comment",
          "patching_rect": [
            649,
            7,
            58,
            14
          ],
          "text": "Stopped",
          "fontsize": 8,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 1,
          "presentation": 1,
          "presentation_rect": [
            649,
            7,
            58,
            14
          ],
          "varname": "transport-display",
          "ignoreclick": 1,
          "annotation_name": "Live Transport",
          "annotation": "Current Live transport state observed from Song.is_playing.",
          "hint": "Current Live transport state observed from Song.is_playing."
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "comment",
          "patching_rect": [
            712,
            7,
            94,
            14
          ],
          "text": "Loading…",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 2,
          "presentation": 1,
          "presentation_rect": [
            712,
            7,
            94,
            14
          ],
          "varname": "status-display",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-17",
          "maxclass": "comment",
          "patching_rect": [
            16,
            36,
            196,
            10
          ],
          "text": "MOTIF",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            16,
            36,
            196,
            10
          ],
          "varname": "motif-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "umenu",
          "patching_rect": [
            16,
            47,
            196,
            20
          ],
          "items": [
            "Loading…"
          ],
          "fontsize": 9,
          "bgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
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
            16,
            47,
            196,
            20
          ],
          "varname": "motif-menu",
          "annotation_name": "Selected Motif",
          "annotation": "Choose the phrase played when a trigger note is received. The preview and motif details update immediately.",
          "hint": "Choose the phrase played when a trigger note is received. The preview and motif details update immediately."
        }
      },
      {
        "box": {
          "id": "obj-19",
          "maxclass": "comment",
          "patching_rect": [
            218,
            36,
            92,
            10
          ],
          "text": "PITCH MODE",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            218,
            36,
            92,
            10
          ],
          "varname": "pitch-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-20",
          "maxclass": "live.menu",
          "patching_rect": [
            218,
            47,
            92,
            20
          ],
          "appearance": 0,
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            218,
            47,
            92,
            20
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "auto",
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
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "focusbordercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "lcdbgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "lcdcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "hlttextcolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "annotation_name": "Pitch Mode",
          "annotation": "Auto uses the motif default. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.",
          "hint": "Auto uses the motif default. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals."
        }
      },
      {
        "box": {
          "id": "obj-21",
          "maxclass": "comment",
          "patching_rect": [
            316,
            37,
            184,
            14
          ],
          "text": "C3 anchor  •  Major  •  chromatic",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "textjustification": 2,
          "presentation": 1,
          "presentation_rect": [
            316,
            37,
            184,
            14
          ],
          "varname": "preview-root-display",
          "ignoreclick": 1,
          "annotation_name": "Preview Context",
          "annotation": "Shows the trigger anchor, Live scale, and effective pitch mode used to calculate the preview.",
          "hint": "Shows the trigger anchor, Live scale, and effective pitch mode used to calculate the preview."
        }
      },
      {
        "box": {
          "id": "obj-22",
          "maxclass": "multislider",
          "patching_rect": [
            16,
            71,
            484,
            24
          ],
          "settype": 0,
          "setstyle": 0,
          "setminmax": [
            0,
            12
          ],
          "size": 6,
          "thickness": 3,
          "spacing": 5,
          "drawpeaks": 0,
          "contdata": 2,
          "listresize": 1,
          "bgcolor": [
            0.055,
            0.058,
            0.062,
            1
          ],
          "slidercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "ignoreclick": 1,
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            16,
            71,
            484,
            24
          ],
          "varname": "motif-preview",
          "annotation_name": "Motif Note Preview",
          "annotation": "A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, and most recent trigger note.",
          "hint": "A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, and most recent trigger note."
        }
      },
      {
        "box": {
          "id": "obj-23",
          "maxclass": "comment",
          "patching_rect": [
            16,
            97,
            484,
            10
          ],
          "text": "C3  ·  A♯2  ·  D♯3  ·  D3  ·  C♯3  ·  C3",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 1,
          "presentation": 1,
          "presentation_rect": [
            16,
            97,
            484,
            10
          ],
          "varname": "preview-notes-display",
          "ignoreclick": 1,
          "annotation_name": "Preview Notes",
          "annotation": "The exact MIDI note names that the current preview will play.",
          "hint": "The exact MIDI note names that the current preview will play."
        }
      },
      {
        "box": {
          "id": "obj-24",
          "maxclass": "comment",
          "patching_rect": [
            524,
            37,
            278,
            16
          ],
          "text": "Mitsuda Lick",
          "fontsize": 11,
          "fontface": 1,
          "textcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            524,
            37,
            278,
            16
          ],
          "varname": "motif-title-display",
          "ignoreclick": 1,
          "annotation_name": "Motif Name",
          "annotation": "Human-readable name of the selected motif.",
          "hint": "Human-readable name of the selected motif."
        }
      },
      {
        "box": {
          "id": "obj-25",
          "maxclass": "comment",
          "patching_rect": [
            524,
            54,
            278,
            11
          ],
          "text": "6 notes  •  2 bars  •  4/4 source  •  chromatic",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            524,
            54,
            278,
            11
          ],
          "varname": "motif-stats-display",
          "ignoreclick": 1,
          "annotation_name": "Motif Statistics",
          "annotation": "Note count, effective length, source meter, and effective pitch interpretation.",
          "hint": "Note count, effective length, source meter, and effective pitch interpretation."
        }
      },
      {
        "box": {
          "id": "obj-26",
          "maxclass": "comment",
          "patching_rect": [
            524,
            67,
            278,
            26
          ],
          "text": "Canonical two-bar contour: long tonic, step down, leap up a fourth, then a fast chromatic descent to tonic.",
          "fontsize": 8,
          "fontface": 0,
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textjustification": 0,
          "linecount": 2,
          "presentation": 1,
          "presentation_rect": [
            524,
            67,
            278,
            26
          ],
          "varname": "motif-description-display",
          "ignoreclick": 1,
          "annotation_name": "Motif Description",
          "annotation": "Description stored with the selected motif.",
          "hint": "Description stored with the selected motif."
        }
      },
      {
        "box": {
          "id": "obj-27",
          "maxclass": "comment",
          "patching_rect": [
            524,
            96,
            278,
            10
          ],
          "text": "mitsuda · chromatic · cadence",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.55,
            0.31,
            0.1,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            524,
            96,
            278,
            10
          ],
          "varname": "motif-tags-display",
          "ignoreclick": 1,
          "annotation_name": "Motif Tags",
          "annotation": "Tags and suggested modes stored in the motif metadata.",
          "hint": "Tags and suggested modes stored in the motif metadata."
        }
      },
      {
        "box": {
          "id": "obj-28",
          "maxclass": "comment",
          "patching_rect": [
            16,
            116,
            90,
            9
          ],
          "text": "TRIGGER",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            16,
            116,
            90,
            9
          ],
          "varname": "trigger-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-29",
          "maxclass": "live.menu",
          "patching_rect": [
            16,
            128,
            92,
            21
          ],
          "appearance": 0,
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            16,
            128,
            92,
            21
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
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "focusbordercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "lcdbgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "lcdcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "hlttextcolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "annotation_name": "Trigger Mode",
          "annotation": "One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish.",
          "hint": "One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish."
        }
      },
      {
        "box": {
          "id": "obj-30",
          "maxclass": "comment",
          "patching_rect": [
            114,
            116,
            72,
            9
          ],
          "text": "LAUNCH",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            114,
            116,
            72,
            9
          ],
          "varname": "quant-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-31",
          "maxclass": "live.menu",
          "patching_rect": [
            114,
            128,
            76,
            21
          ],
          "appearance": 0,
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            114,
            128,
            76,
            21
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
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "focusbordercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "lcdbgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "lcdcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "hlttextcolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "annotation_name": "Launch Quantization",
          "annotation": "Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.",
          "hint": "Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received."
        }
      },
      {
        "box": {
          "id": "obj-32",
          "maxclass": "comment",
          "patching_rect": [
            196,
            116,
            94,
            9
          ],
          "text": "MIDI PASS",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            196,
            116,
            94,
            9
          ],
          "varname": "pass-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-33",
          "maxclass": "live.menu",
          "patching_rect": [
            196,
            128,
            100,
            21
          ],
          "appearance": 0,
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            196,
            128,
            100,
            21
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
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "focusbordercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "lcdbgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "lcdcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "hlttextcolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "annotation_name": "MIDI Pass Through",
          "annotation": "None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.",
          "hint": "None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif."
        }
      },
      {
        "box": {
          "id": "obj-34",
          "maxclass": "comment",
          "patching_rect": [
            302,
            116,
            92,
            9
          ],
          "text": "METER",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            302,
            116,
            92,
            9
          ],
          "varname": "meter-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-35",
          "maxclass": "live.tab",
          "patching_rect": [
            302,
            128,
            98,
            21
          ],
          "fontsize": 9,
          "mode": 0,
          "multiline": 0,
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            302,
            128,
            98,
            21
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
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "focusbordercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "lcdbgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "lcdcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "hlttextcolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "annotation_name": "Meter Mode",
          "annotation": "Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.",
          "hint": "Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature."
        }
      },
      {
        "box": {
          "id": "obj-36",
          "maxclass": "comment",
          "patching_rect": [
            406,
            116,
            94,
            9
          ],
          "text": "RETRIGGER",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            406,
            116,
            94,
            9
          ],
          "varname": "retrigger-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-37",
          "maxclass": "live.tab",
          "patching_rect": [
            406,
            128,
            100,
            21
          ],
          "fontsize": 9,
          "mode": 0,
          "multiline": 0,
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            406,
            128,
            100,
            21
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
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "focusbordercolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "lcdbgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "lcdcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "hltcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "hlttextcolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "valuepopup": 1,
          "valuepopuplabel": 3,
          "annotation_name": "Retrigger Mode",
          "annotation": "Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.",
          "hint": "Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together."
        }
      },
      {
        "box": {
          "id": "obj-38",
          "maxclass": "comment",
          "patching_rect": [
            512,
            116,
            80,
            9
          ],
          "text": "ZONE",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            512,
            116,
            80,
            9
          ],
          "varname": "zone-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-39",
          "maxclass": "live.numbox",
          "patching_rect": [
            512,
            128,
            38,
            21
          ],
          "appearance": 4,
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            512,
            128,
            38,
            21
          ],
          "activebgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "activetricolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "textcolor": [
            1,
            0.55,
            0.12,
            1
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
          "annotation_name": "Trigger Zone Low",
          "annotation": "Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.",
          "hint": "Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting."
        }
      },
      {
        "box": {
          "id": "obj-40",
          "maxclass": "live.numbox",
          "patching_rect": [
            554,
            128,
            38,
            21
          ],
          "appearance": 4,
          "fontsize": 10,
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            554,
            128,
            38,
            21
          ],
          "activebgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "activetricolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "textcolor": [
            1,
            0.55,
            0.12,
            1
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
          "annotation_name": "Trigger Zone High",
          "annotation": "Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.",
          "hint": "Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting."
        }
      },
      {
        "box": {
          "id": "obj-41",
          "maxclass": "comment",
          "patching_rect": [
            598,
            116,
            80,
            9
          ],
          "text": "LIBRARY",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            598,
            116,
            80,
            9
          ],
          "varname": "library-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-42",
          "maxclass": "live.text",
          "patching_rect": [
            598,
            128,
            48,
            21
          ],
          "appearance": 0,
          "fontsize": 8,
          "mode": 0,
          "parameter_enable": 0,
          "rounded": 4,
          "text": "Choose",
          "texton": "Choose",
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "presentation": 1,
          "presentation_rect": [
            598,
            128,
            48,
            21
          ],
          "varname": "choose-library",
          "annotation_name": "Choose Motif Library",
          "annotation": "Select a folder containing additional motif JSON files. Built-in motifs remain available.",
          "hint": "Select a folder containing additional motif JSON files. Built-in motifs remain available."
        }
      },
      {
        "box": {
          "id": "obj-43",
          "maxclass": "live.text",
          "patching_rect": [
            650,
            128,
            28,
            21
          ],
          "appearance": 0,
          "fontsize": 11,
          "mode": 0,
          "parameter_enable": 0,
          "rounded": 4,
          "text": "↻",
          "texton": "↻",
          "activebgcolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "activebgoncolor": [
            1,
            0.55,
            0.12,
            1
          ],
          "bgcolor": [
            0.095,
            0.098,
            0.105,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textoncolor": [
            0.05,
            0.05,
            0.055,
            1
          ],
          "presentation": 1,
          "presentation_rect": [
            650,
            128,
            28,
            21
          ],
          "varname": "refresh-button",
          "annotation_name": "Refresh Motif Library",
          "annotation": "Reload built-in motifs and all JSON motifs from the selected library folder.",
          "hint": "Reload built-in motifs and all JSON motifs from the selected library folder."
        }
      },
      {
        "box": {
          "id": "obj-44",
          "maxclass": "comment",
          "patching_rect": [
            684,
            116,
            34,
            9
          ],
          "text": "PANIC",
          "fontsize": 7,
          "fontface": 0,
          "textcolor": [
            0.58,
            0.59,
            0.63,
            1
          ],
          "textjustification": 0,
          "presentation": 1,
          "presentation_rect": [
            684,
            116,
            34,
            9
          ],
          "varname": "panic-label",
          "ignoreclick": 1
        }
      },
      {
        "box": {
          "id": "obj-45",
          "maxclass": "live.text",
          "patching_rect": [
            684,
            128,
            34,
            21
          ],
          "appearance": 0,
          "fontsize": 11,
          "mode": 0,
          "parameter_enable": 0,
          "rounded": 4,
          "text": "!",
          "texton": "!",
          "activebgcolor": [
            0.95,
            0.25,
            0.28,
            1
          ],
          "activebgoncolor": [
            0.95,
            0.25,
            0.28,
            1
          ],
          "bgcolor": [
            0.95,
            0.25,
            0.28,
            1
          ],
          "bordercolor": [
            0.16,
            0.16,
            0.17,
            1
          ],
          "textcolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "textoncolor": [
            0.88,
            0.88,
            0.9,
            1
          ],
          "presentation": 1,
          "presentation_rect": [
            684,
            128,
            34,
            21
          ],
          "varname": "panic-button",
          "annotation_name": "Panic",
          "annotation": "Immediately clears scheduled phrase events and sends note-offs for active MIDI notes.",
          "hint": "Immediately clears scheduled phrase events and sends note-offs for active MIDI notes."
        }
      },
      {
        "box": {
          "id": "obj-46",
          "maxclass": "newobj",
          "patching_rect": [
            30,
            270,
            50,
            22
          ],
          "text": "midiin"
        }
      },
      {
        "box": {
          "id": "obj-47",
          "maxclass": "newobj",
          "patching_rect": [
            30,
            305,
            65,
            22
          ],
          "text": "gate 2 1"
        }
      },
      {
        "box": {
          "id": "obj-48",
          "maxclass": "newobj",
          "patching_rect": [
            105,
            305,
            75,
            22
          ],
          "text": "loadmess 1"
        }
      },
      {
        "box": {
          "id": "obj-49",
          "maxclass": "message",
          "patching_rect": [
            185,
            305,
            30,
            22
          ],
          "text": "2"
        }
      },
      {
        "box": {
          "id": "obj-50",
          "maxclass": "newobj",
          "patching_rect": [
            30,
            345,
            190,
            22
          ],
          "text": "midiselect @ch all @note all"
        }
      },
      {
        "box": {
          "id": "obj-51",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            345,
            70,
            22
          ],
          "text": "midiparse"
        }
      },
      {
        "box": {
          "id": "obj-52",
          "maxclass": "newobj",
          "patching_rect": [
            30,
            385,
            80,
            22
          ],
          "text": "unpack 0 0"
        }
      },
      {
        "box": {
          "id": "obj-53",
          "maxclass": "newobj",
          "patching_rect": [
            30,
            420,
            85,
            22
          ],
          "text": "pack 0 0 1"
        }
      },
      {
        "box": {
          "id": "obj-54",
          "maxclass": "newobj",
          "patching_rect": [
            30,
            455,
            90,
            22
          ],
          "text": "prepend note"
        }
      },
      {
        "box": {
          "id": "obj-55",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            385,
            65,
            22
          ],
          "text": "route 64"
        }
      },
      {
        "box": {
          "id": "obj-56",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            420,
            65,
            22
          ],
          "text": "pack 0 1"
        }
      },
      {
        "box": {
          "id": "obj-57",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            455,
            110,
            22
          ],
          "text": "prepend sustain"
        }
      },
      {
        "box": {
          "id": "obj-58",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            415,
            175,
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
          "id": "obj-59",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            460,
            765,
            22
          ],
          "text": "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui"
        }
      },
      {
        "box": {
          "id": "obj-60",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            500,
            115,
            22
          ],
          "text": "unpack 0 0 0 0."
        }
      },
      {
        "box": {
          "id": "obj-61",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            540,
            105,
            22
          ],
          "text": "pipe 0 0 0 0."
        }
      },
      {
        "box": {
          "id": "obj-62",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            580,
            65,
            22
          ],
          "text": "pack 0 0"
        }
      },
      {
        "box": {
          "id": "obj-63",
          "maxclass": "newobj",
          "patching_rect": [
            360,
            620,
            75,
            22
          ],
          "text": "midiformat"
        }
      },
      {
        "box": {
          "id": "obj-64",
          "maxclass": "newobj",
          "patching_rect": [
            170,
            660,
            65,
            22
          ],
          "text": "midiflush"
        }
      },
      {
        "box": {
          "id": "obj-65",
          "maxclass": "newobj",
          "patching_rect": [
            170,
            700,
            55,
            22
          ],
          "text": "midiout"
        }
      },
      {
        "box": {
          "id": "obj-66",
          "maxclass": "newobj",
          "patching_rect": [
            485,
            500,
            45,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-67",
          "maxclass": "message",
          "patching_rect": [
            540,
            540,
            40,
            22
          ],
          "text": "clear"
        }
      },
      {
        "box": {
          "id": "obj-68",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            500,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-69",
          "maxclass": "newobj",
          "patching_rect": [
            690,
            500,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-70",
          "maxclass": "message",
          "patching_rect": [
            780,
            500,
            40,
            22
          ],
          "text": "clear"
        }
      },
      {
        "box": {
          "id": "obj-71",
          "maxclass": "newobj",
          "patching_rect": [
            830,
            500,
            100,
            22
          ],
          "text": "prepend append"
        }
      },
      {
        "box": {
          "id": "obj-72",
          "maxclass": "newobj",
          "patching_rect": [
            940,
            500,
            115,
            22
          ],
          "text": "prepend setsymbol"
        }
      },
      {
        "box": {
          "id": "obj-73",
          "maxclass": "newobj",
          "patching_rect": [
            1065,
            500,
            760,
            22
          ],
          "text": "route preview-pitches preview-range preview-notes preview-root motif-title motif-description motif-stats motif-tags"
        }
      },
      {
        "box": {
          "id": "obj-74",
          "maxclass": "newobj",
          "patching_rect": [
            1065,
            540,
            95,
            22
          ],
          "text": "prepend setlist"
        }
      },
      {
        "box": {
          "id": "obj-75",
          "maxclass": "newobj",
          "patching_rect": [
            1170,
            540,
            95,
            22
          ],
          "text": "prepend setmax"
        }
      },
      {
        "box": {
          "id": "obj-76",
          "maxclass": "newobj",
          "patching_rect": [
            1275,
            540,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-77",
          "maxclass": "newobj",
          "patching_rect": [
            1365,
            540,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-78",
          "maxclass": "newobj",
          "patching_rect": [
            1455,
            540,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-79",
          "maxclass": "newobj",
          "patching_rect": [
            1545,
            540,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-80",
          "maxclass": "newobj",
          "patching_rect": [
            1635,
            540,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-81",
          "maxclass": "newobj",
          "patching_rect": [
            1725,
            540,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-82",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            270,
            95,
            22
          ],
          "text": "live.thisdevice"
        }
      },
      {
        "box": {
          "id": "obj-83",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            305,
            60,
            22
          ],
          "text": "t b b b"
        }
      },
      {
        "box": {
          "id": "obj-84",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            305,
            155,
            22
          ],
          "text": "t b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-85",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            345,
            115,
            22
          ],
          "text": "live.path live_set"
        }
      },
      {
        "box": {
          "id": "obj-86",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            385,
            60,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-87",
          "maxclass": "message",
          "patching_rect": [
            520,
            420,
            65,
            22
          ],
          "text": "initialize"
        }
      },
      {
        "box": {
          "id": "obj-88",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            420,
            60,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-89",
          "maxclass": "newobj",
          "patching_rect": [
            670,
            420,
            80,
            22
          ],
          "text": "route Ready"
        }
      },
      {
        "box": {
          "id": "obj-90",
          "maxclass": "newobj",
          "patching_rect": [
            760,
            420,
            45,
            22
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-91",
          "maxclass": "newobj",
          "patching_rect": [
            815,
            420,
            175,
            22
          ],
          "text": "t b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "obj-92",
          "maxclass": "message",
          "patching_rect": [
            425,
            385,
            90,
            22
          ],
          "text": "presentation 1"
        }
      },
      {
        "box": {
          "id": "obj-93",
          "maxclass": "newobj",
          "patching_rect": [
            425,
            420,
            75,
            22
          ],
          "text": "thispatcher"
        }
      },
      {
        "box": {
          "id": "obj-94",
          "maxclass": "newobj",
          "patching_rect": [
            425,
            345,
            145,
            22
          ],
          "text": "loadmess presentation 1"
        }
      },
      {
        "box": {
          "id": "obj-95",
          "maxclass": "message",
          "patching_rect": [
            620,
            350,
            170,
            22
          ],
          "text": "property tempo"
        }
      },
      {
        "box": {
          "id": "obj-96",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            350,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-97",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            350,
            180,
            22
          ],
          "text": "prepend tempo"
        }
      },
      {
        "box": {
          "id": "obj-98",
          "maxclass": "newobj",
          "patching_rect": [
            1090,
            350,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-99",
          "maxclass": "message",
          "patching_rect": [
            620,
            390,
            170,
            22
          ],
          "text": "property root_note"
        }
      },
      {
        "box": {
          "id": "obj-100",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            390,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-101",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            390,
            180,
            22
          ],
          "text": "prepend root_note"
        }
      },
      {
        "box": {
          "id": "obj-102",
          "maxclass": "newobj",
          "patching_rect": [
            1090,
            390,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-103",
          "maxclass": "message",
          "patching_rect": [
            620,
            430,
            170,
            22
          ],
          "text": "property scale_mode"
        }
      },
      {
        "box": {
          "id": "obj-104",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            430,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-105",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            430,
            180,
            22
          ],
          "text": "prepend scale_mode"
        }
      },
      {
        "box": {
          "id": "obj-106",
          "maxclass": "newobj",
          "patching_rect": [
            1090,
            430,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-107",
          "maxclass": "message",
          "patching_rect": [
            620,
            470,
            170,
            22
          ],
          "text": "property scale_intervals"
        }
      },
      {
        "box": {
          "id": "obj-108",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            470,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-109",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            470,
            180,
            22
          ],
          "text": "prepend scale_intervals"
        }
      },
      {
        "box": {
          "id": "obj-110",
          "maxclass": "newobj",
          "patching_rect": [
            1090,
            470,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-111",
          "maxclass": "message",
          "patching_rect": [
            980,
            350,
            170,
            22
          ],
          "text": "property scale_name"
        }
      },
      {
        "box": {
          "id": "obj-112",
          "maxclass": "newobj",
          "patching_rect": [
            1160,
            350,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-113",
          "maxclass": "newobj",
          "patching_rect": [
            1260,
            350,
            180,
            22
          ],
          "text": "prepend scale_name"
        }
      },
      {
        "box": {
          "id": "obj-114",
          "maxclass": "newobj",
          "patching_rect": [
            1450,
            350,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-115",
          "maxclass": "message",
          "patching_rect": [
            980,
            390,
            170,
            22
          ],
          "text": "property signature_numerator"
        }
      },
      {
        "box": {
          "id": "obj-116",
          "maxclass": "newobj",
          "patching_rect": [
            1160,
            390,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-117",
          "maxclass": "newobj",
          "patching_rect": [
            1260,
            390,
            180,
            22
          ],
          "text": "prepend signature_numerator"
        }
      },
      {
        "box": {
          "id": "obj-118",
          "maxclass": "newobj",
          "patching_rect": [
            1450,
            390,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-119",
          "maxclass": "message",
          "patching_rect": [
            980,
            430,
            170,
            22
          ],
          "text": "property signature_denominator"
        }
      },
      {
        "box": {
          "id": "obj-120",
          "maxclass": "newobj",
          "patching_rect": [
            1160,
            430,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-121",
          "maxclass": "newobj",
          "patching_rect": [
            1260,
            430,
            180,
            22
          ],
          "text": "prepend signature_denominator"
        }
      },
      {
        "box": {
          "id": "obj-122",
          "maxclass": "newobj",
          "patching_rect": [
            1450,
            430,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-123",
          "maxclass": "message",
          "patching_rect": [
            980,
            470,
            170,
            22
          ],
          "text": "property is_playing"
        }
      },
      {
        "box": {
          "id": "obj-124",
          "maxclass": "newobj",
          "patching_rect": [
            1160,
            470,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-125",
          "maxclass": "newobj",
          "patching_rect": [
            1260,
            470,
            180,
            22
          ],
          "text": "prepend is_playing"
        }
      },
      {
        "box": {
          "id": "obj-126",
          "maxclass": "newobj",
          "patching_rect": [
            1450,
            470,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-127",
          "maxclass": "message",
          "patching_rect": [
            980,
            510,
            170,
            22
          ],
          "text": "property current_song_time"
        }
      },
      {
        "box": {
          "id": "obj-128",
          "maxclass": "newobj",
          "patching_rect": [
            1160,
            510,
            90,
            22
          ],
          "text": "live.observer"
        }
      },
      {
        "box": {
          "id": "obj-129",
          "maxclass": "newobj",
          "patching_rect": [
            1260,
            510,
            180,
            22
          ],
          "text": "prepend current_song_time"
        }
      },
      {
        "box": {
          "id": "obj-130",
          "maxclass": "newobj",
          "patching_rect": [
            1450,
            510,
            145,
            22
          ],
          "text": "prepend song_context"
        }
      },
      {
        "box": {
          "id": "obj-131",
          "maxclass": "newobj",
          "patching_rect": [
            620,
            560,
            220,
            22
          ],
          "text": "sel 0 1 2 3 4 5 6 7 8 9 10 11"
        }
      },
      {
        "box": {
          "id": "obj-132",
          "maxclass": "message",
          "patching_rect": [
            620,
            595,
            45,
            22
          ],
          "text": "set C"
        }
      },
      {
        "box": {
          "id": "obj-133",
          "maxclass": "message",
          "patching_rect": [
            668,
            595,
            45,
            22
          ],
          "text": "set C♯"
        }
      },
      {
        "box": {
          "id": "obj-134",
          "maxclass": "message",
          "patching_rect": [
            716,
            595,
            45,
            22
          ],
          "text": "set D"
        }
      },
      {
        "box": {
          "id": "obj-135",
          "maxclass": "message",
          "patching_rect": [
            764,
            595,
            45,
            22
          ],
          "text": "set D♯"
        }
      },
      {
        "box": {
          "id": "obj-136",
          "maxclass": "message",
          "patching_rect": [
            812,
            595,
            45,
            22
          ],
          "text": "set E"
        }
      },
      {
        "box": {
          "id": "obj-137",
          "maxclass": "message",
          "patching_rect": [
            860,
            595,
            45,
            22
          ],
          "text": "set F"
        }
      },
      {
        "box": {
          "id": "obj-138",
          "maxclass": "message",
          "patching_rect": [
            908,
            595,
            45,
            22
          ],
          "text": "set F♯"
        }
      },
      {
        "box": {
          "id": "obj-139",
          "maxclass": "message",
          "patching_rect": [
            956,
            595,
            45,
            22
          ],
          "text": "set G"
        }
      },
      {
        "box": {
          "id": "obj-140",
          "maxclass": "message",
          "patching_rect": [
            1004,
            595,
            45,
            22
          ],
          "text": "set G♯"
        }
      },
      {
        "box": {
          "id": "obj-141",
          "maxclass": "message",
          "patching_rect": [
            1052,
            595,
            45,
            22
          ],
          "text": "set A"
        }
      },
      {
        "box": {
          "id": "obj-142",
          "maxclass": "message",
          "patching_rect": [
            1100,
            595,
            45,
            22
          ],
          "text": "set A♯"
        }
      },
      {
        "box": {
          "id": "obj-143",
          "maxclass": "message",
          "patching_rect": [
            1148,
            595,
            45,
            22
          ],
          "text": "set B"
        }
      },
      {
        "box": {
          "id": "obj-144",
          "maxclass": "newobj",
          "patching_rect": [
            850,
            560,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-145",
          "maxclass": "newobj",
          "patching_rect": [
            940,
            560,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-146",
          "maxclass": "newobj",
          "patching_rect": [
            1030,
            560,
            55,
            22
          ],
          "text": "sel 0 1"
        }
      },
      {
        "box": {
          "id": "obj-147",
          "maxclass": "message",
          "patching_rect": [
            1095,
            550,
            90,
            22
          ],
          "text": "set Scale Off"
        }
      },
      {
        "box": {
          "id": "obj-148",
          "maxclass": "message",
          "patching_rect": [
            1095,
            575,
            90,
            22
          ],
          "text": "set Scale On"
        }
      },
      {
        "box": {
          "id": "obj-149",
          "maxclass": "newobj",
          "patching_rect": [
            1195,
            560,
            60,
            22
          ],
          "text": "pak 4 4"
        }
      },
      {
        "box": {
          "id": "obj-150",
          "maxclass": "newobj",
          "patching_rect": [
            1265,
            560,
            100,
            22
          ],
          "text": "sprintf %ld/%ld"
        }
      },
      {
        "box": {
          "id": "obj-151",
          "maxclass": "newobj",
          "patching_rect": [
            1375,
            560,
            80,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-152",
          "maxclass": "newobj",
          "patching_rect": [
            1465,
            560,
            55,
            22
          ],
          "text": "sel 0 1"
        }
      },
      {
        "box": {
          "id": "obj-153",
          "maxclass": "message",
          "patching_rect": [
            1530,
            550,
            80,
            22
          ],
          "text": "set Stopped"
        }
      },
      {
        "box": {
          "id": "obj-154",
          "maxclass": "message",
          "patching_rect": [
            1530,
            575,
            80,
            22
          ],
          "text": "set Playing"
        }
      },
      {
        "box": {
          "id": "obj-155",
          "maxclass": "newobj",
          "patching_rect": [
            620,
            650,
            95,
            22
          ],
          "text": "prepend motif"
        }
      },
      {
        "box": {
          "id": "obj-156",
          "maxclass": "newobj",
          "patching_rect": [
            725,
            650,
            125,
            22
          ],
          "text": "prepend pitch_mode"
        }
      },
      {
        "box": {
          "id": "obj-157",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            650,
            135,
            22
          ],
          "text": "prepend trigger_mode"
        }
      },
      {
        "box": {
          "id": "obj-158",
          "maxclass": "newobj",
          "patching_rect": [
            1005,
            650,
            180,
            22
          ],
          "text": "prepend launch_quantization"
        }
      },
      {
        "box": {
          "id": "obj-159",
          "maxclass": "newobj",
          "patching_rect": [
            1195,
            650,
            145,
            22
          ],
          "text": "prepend pass_through"
        }
      },
      {
        "box": {
          "id": "obj-160",
          "maxclass": "newobj",
          "patching_rect": [
            620,
            690,
            125,
            22
          ],
          "text": "prepend meter_mode"
        }
      },
      {
        "box": {
          "id": "obj-161",
          "maxclass": "newobj",
          "patching_rect": [
            755,
            690,
            115,
            22
          ],
          "text": "prepend retrigger"
        }
      },
      {
        "box": {
          "id": "obj-162",
          "maxclass": "newobj",
          "patching_rect": [
            880,
            690,
            120,
            22
          ],
          "text": "prepend trigger_low"
        }
      },
      {
        "box": {
          "id": "obj-163",
          "maxclass": "newobj",
          "patching_rect": [
            1010,
            690,
            125,
            22
          ],
          "text": "prepend trigger_high"
        }
      },
      {
        "box": {
          "id": "obj-164",
          "maxclass": "newobj",
          "patching_rect": [
            1145,
            690,
            100,
            22
          ],
          "text": "opendialog fold"
        }
      },
      {
        "box": {
          "id": "obj-165",
          "maxclass": "newobj",
          "patching_rect": [
            1255,
            690,
            135,
            22
          ],
          "text": "prepend library_path"
        }
      },
      {
        "box": {
          "id": "obj-166",
          "maxclass": "message",
          "patching_rect": [
            1145,
            730,
            95,
            22
          ],
          "text": "refresh_library"
        }
      },
      {
        "box": {
          "id": "obj-167",
          "maxclass": "message",
          "patching_rect": [
            1250,
            730,
            45,
            22
          ],
          "text": "panic"
        }
      },
      {
        "box": {
          "id": "obj-168",
          "maxclass": "newobj",
          "patching_rect": [
            620,
            750,
            75,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-169",
          "maxclass": "newobj",
          "patching_rect": [
            700,
            750,
            75,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-170",
          "maxclass": "newobj",
          "patching_rect": [
            780,
            750,
            75,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-171",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            750,
            75,
            22
          ],
          "text": "loadmess 1"
        }
      },
      {
        "box": {
          "id": "obj-172",
          "maxclass": "newobj",
          "patching_rect": [
            940,
            750,
            75,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-173",
          "maxclass": "newobj",
          "patching_rect": [
            1020,
            750,
            75,
            22
          ],
          "text": "loadmess 0"
        }
      },
      {
        "box": {
          "id": "obj-174",
          "maxclass": "newobj",
          "patching_rect": [
            1100,
            750,
            75,
            22
          ],
          "text": "loadmess 36"
        }
      },
      {
        "box": {
          "id": "obj-175",
          "maxclass": "newobj",
          "patching_rect": [
            1180,
            750,
            75,
            22
          ],
          "text": "loadmess 84"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-96",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-100",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-104",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-108",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-112",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-116",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-120",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-124",
            1
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
            "obj-88",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-84",
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
            "obj-85",
            0
          ],
          "destination": [
            "obj-128",
            1
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
            "obj-88",
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
            "obj-132",
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
            "obj-133",
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
            "obj-131",
            2
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            3
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            4
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            5
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            6
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            7
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            8
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            9
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            10
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-131",
            11
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
            "obj-9",
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
            "obj-131",
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
            "obj-12",
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
            "obj-10",
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
            "obj-147",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-146",
            1
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
            "obj-147",
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
            "obj-148",
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
            "obj-116",
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
            "obj-120",
            0
          ],
          "destination": [
            "obj-149",
            1
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
            "obj-14",
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
            "obj-153",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-152",
            1
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
            "obj-153",
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
            "obj-154",
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
            2
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
            "obj-83",
            1
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
            "obj-83",
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
            "obj-58",
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
            "obj-58",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
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
            "obj-90",
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
            "obj-96",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-91",
            1
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
            "obj-91",
            2
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
            "obj-91",
            3
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
            "obj-91",
            4
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
            "obj-91",
            5
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
            "obj-91",
            6
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
            "obj-91",
            7
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
            "obj-91",
            8
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
            "obj-94",
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
            "obj-46",
            0
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
            "obj-48",
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
            "obj-64",
            0
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
            "obj-50",
            0
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
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-50",
            7
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
            "obj-50",
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
            "obj-50",
            6
          ],
          "destination": [
            "obj-53",
            2
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
            "obj-53",
            1
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
            "obj-54",
            0
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
            "obj-51",
            6
          ],
          "destination": [
            "obj-56",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-51",
            2
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
            "obj-57",
            0
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
            "obj-61",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            1
          ],
          "destination": [
            "obj-61",
            1
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
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            3
          ],
          "destination": [
            "obj-61",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
            2
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
            1
          ],
          "destination": [
            "obj-62",
            1
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
            0
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
            "obj-64",
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
            "obj-59",
            1
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
            "obj-66",
            0
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
            "obj-59",
            2
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
            "obj-61",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            3
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
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            4
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
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            6
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
            "obj-70",
            0
          ],
          "destination": [
            "obj-18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            7
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
            "obj-18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            8
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
            "obj-18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            10
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
            "obj-22",
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
            "obj-22",
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
            "obj-23",
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
            "obj-21",
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
            "obj-24",
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
            "obj-26",
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
            "obj-25",
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
            "obj-27",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-18",
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
            "obj-58",
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
            "obj-58",
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
            "obj-58",
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
            "obj-58",
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
            "obj-58",
            0
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
            "obj-58",
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
            "obj-58",
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
            "obj-58",
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
            "obj-58",
            0
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
            "obj-58",
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
            "obj-58",
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
            "obj-58",
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
            "obj-20",
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
            "obj-29",
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
            "obj-31",
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
            "obj-33",
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
            "obj-35",
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
            "obj-37",
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
            "obj-39",
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
            "obj-40",
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
