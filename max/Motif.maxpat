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
      85.0,
      104.0,
      820.0,
      620.0
    ],
    "bglocked": 0,
    "openinpresentation": 0,
    "default_fontsize": 12.0,
    "default_fontface": 0,
    "default_fontname": "Arial",
    "gridonopen": 1,
    "gridsize": [
      15.0,
      15.0
    ],
    "gridsnaponopen": 1,
    "objectsnaponopen": 1,
    "statusbarvisible": 2,
    "toolbarvisible": 1,
    "lefttoolbarpinned": 0,
    "toptoolbarpinned": 0,
    "righttoolbarpinned": 0,
    "bottomtoolbarpinned": 0,
    "toolbars_unpinned_last_save": 0,
    "tallnewobj": 0,
    "boxanimatetime": 200,
    "enablehscroll": 1,
    "enablevscroll": 1,
    "devicewidth": 780.0,
    "description": "Scale-aware triggerable motif engine",
    "digest": "TypeScript motif engine with native Max scheduling",
    "tags": "midi motif phrase scale",
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "comment",
          "patching_rect": [
            30.0,
            20.0,
            500.0,
            24.0
          ],
          "text": "Motif \u2014 scale-aware one-key phrase trigger (TypeScript + Max native scheduling)"
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "newobj",
          "patching_rect": [
            30.0,
            70.0,
            47.0,
            22.0
          ],
          "text": "midiin"
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "newobj",
          "patching_rect": [
            30.0,
            110.0,
            65.0,
            22.0
          ],
          "text": "midiparse"
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "newobj",
          "patching_rect": [
            30.0,
            150.0,
            79.0,
            22.0
          ],
          "text": "unpack 0 0"
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "newobj",
          "patching_rect": [
            30.0,
            190.0,
            82.0,
            22.0
          ],
          "text": "pack 0 0 1"
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "newobj",
          "patching_rect": [
            30.0,
            230.0,
            84.0,
            22.0
          ],
          "text": "prepend note"
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            230.0,
            142.0,
            22.0
          ],
          "text": "v8 motif-device.js"
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            70.0,
            91.0,
            22.0
          ],
          "text": "live.thisdevice"
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            110.0,
            57.0,
            22.0
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "message",
          "patching_rect": [
            190.0,
            150.0,
            58.0,
            22.0
          ],
          "text": "initialize"
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            290.0,
            109.0,
            22.0
          ],
          "text": "unpack 0 0 0 0."
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            330.0,
            101.0,
            22.0
          ],
          "text": "pipe 0 0 0 0."
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            370.0,
            62.0,
            22.0
          ],
          "text": "pack 0 0"
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            410.0,
            69.0,
            22.0
          ],
          "text": "midiformat"
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            450.0,
            58.0,
            22.0
          ],
          "text": "midiflush"
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "newobj",
          "patching_rect": [
            190.0,
            490.0,
            50.0,
            22.0
          ],
          "text": "midiout"
        }
      },
      {
        "box": {
          "id": "obj-17",
          "maxclass": "newobj",
          "patching_rect": [
            360.0,
            290.0,
            70.0,
            22.0
          ],
          "text": "route panic"
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "newobj",
          "patching_rect": [
            360.0,
            330.0,
            40.0,
            22.0
          ],
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "obj-19",
          "maxclass": "message",
          "patching_rect": [
            415.0,
            370.0,
            34.0,
            22.0
          ],
          "text": "clear"
        }
      },
      {
        "box": {
          "id": "obj-20",
          "maxclass": "newobj",
          "patching_rect": [
            455.0,
            330.0,
            66.0,
            22.0
          ],
          "text": "print motif"
        }
      },
      {
        "box": {
          "id": "obj-21",
          "maxclass": "comment",
          "patching_rect": [
            560.0,
            70.0,
            160.0,
            22.0
          ],
          "text": "Motif"
        }
      },
      {
        "box": {
          "id": "obj-22",
          "maxclass": "umenu",
          "patching_rect": [
            560.0,
            95.0,
            170.0,
            22.0
          ],
          "items": [
            "scale-turn",
            ",",
            "quick-answer",
            ",",
            "chromatic-turn"
          ]
        }
      },
      {
        "box": {
          "id": "obj-23",
          "maxclass": "newobj",
          "patching_rect": [
            560.0,
            125.0,
            88.0,
            22.0
          ],
          "text": "prepend motif"
        }
      },
      {
        "box": {
          "id": "obj-24",
          "maxclass": "comment",
          "patching_rect": [
            560.0,
            170.0,
            160.0,
            22.0
          ],
          "text": "Pitch mapping"
        }
      },
      {
        "box": {
          "id": "obj-25",
          "maxclass": "umenu",
          "patching_rect": [
            560.0,
            195.0,
            170.0,
            22.0
          ],
          "items": [
            "auto",
            ",",
            "scale",
            ",",
            "chromatic"
          ]
        }
      },
      {
        "box": {
          "id": "obj-26",
          "maxclass": "newobj",
          "patching_rect": [
            560.0,
            225.0,
            117.0,
            22.0
          ],
          "text": "prepend pitch_mode"
        }
      },
      {
        "box": {
          "id": "obj-27",
          "maxclass": "comment",
          "patching_rect": [
            560.0,
            270.0,
            160.0,
            22.0
          ],
          "text": "Meter behavior"
        }
      },
      {
        "box": {
          "id": "obj-28",
          "maxclass": "umenu",
          "patching_rect": [
            560.0,
            295.0,
            170.0,
            22.0
          ],
          "items": [
            "preserve",
            ",",
            "fit-bar"
          ]
        }
      },
      {
        "box": {
          "id": "obj-29",
          "maxclass": "newobj",
          "patching_rect": [
            560.0,
            325.0,
            119.0,
            22.0
          ],
          "text": "prepend meter_mode"
        }
      },
      {
        "box": {
          "id": "obj-30",
          "maxclass": "comment",
          "patching_rect": [
            560.0,
            370.0,
            160.0,
            22.0
          ],
          "text": "Retrigger behavior"
        }
      },
      {
        "box": {
          "id": "obj-31",
          "maxclass": "umenu",
          "patching_rect": [
            560.0,
            395.0,
            170.0,
            22.0
          ],
          "items": [
            "replace",
            ",",
            "overlap"
          ]
        }
      },
      {
        "box": {
          "id": "obj-32",
          "maxclass": "newobj",
          "patching_rect": [
            560.0,
            425.0,
            108.0,
            22.0
          ],
          "text": "prepend retrigger"
        }
      },
      {
        "box": {
          "id": "obj-33",
          "maxclass": "button",
          "patching_rect": [
            560.0,
            480.0,
            24.0,
            24.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-34",
          "maxclass": "message",
          "patching_rect": [
            595.0,
            480.0,
            40.0,
            22.0
          ],
          "text": "panic"
        }
      },
      {
        "box": {
          "id": "obj-35",
          "maxclass": "comment",
          "patching_rect": [
            645.0,
            480.0,
            120.0,
            22.0
          ],
          "text": "Stop held notes"
        }
      },
      {
        "box": {
          "id": "obj-36",
          "maxclass": "comment",
          "patching_rect": [
            30.0,
            535.0,
            730.0,
            42.0
          ],
          "text": "MVP note: note input is transformed; CC, pitch-bend, aftertouch, and program changes are not passed through yet. Build copies dist/motif-device.js beside this patch."
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-2",
            0
          ],
          "destination": [
            "obj-3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
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
            "obj-3",
            6
          ],
          "destination": [
            "obj-5",
            2
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
            "obj-5",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            0
          ],
          "destination": [
            "obj-5",
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
            "obj-6",
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
            "obj-7",
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
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-9",
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
            "obj-10",
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
            "obj-7",
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
            "obj-11",
            3
          ],
          "destination": [
            "obj-12",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-11",
            2
          ],
          "destination": [
            "obj-12",
            2
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
            "obj-12",
            1
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
            "obj-12",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-12",
            2
          ],
          "destination": [
            "obj-14",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-12",
            1
          ],
          "destination": [
            "obj-13",
            1
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
            "obj-13",
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
            "obj-14",
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
            "obj-15",
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
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-7",
            1
          ],
          "destination": [
            "obj-17",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-17",
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
            "obj-17",
            1
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
            "obj-18",
            1
          ],
          "destination": [
            "obj-19",
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
            "obj-12",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-18",
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
            "obj-22",
            1
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
            "obj-23",
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
            "obj-25",
            1
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
            "obj-26",
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
            "obj-28",
            1
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
            "obj-7",
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
            "obj-7",
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
            "obj-34",
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
            "obj-7",
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