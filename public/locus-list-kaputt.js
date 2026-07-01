ui_schema = {
  "header": {
    "version": 1
  },
  "layout_settings": {
    "allow_ordering_by": [
      "arch_context"
    ],
    "orchestration_strategy": "table",
    "order": [
      "arch_context",
      "type"
    ],
    "order_records_by": [
      ">arch_context"
    ],
    "type": "list"
  },
  "ui_elements": {
    "alternate_id": {
      "element_type": {
        "name": "TextField",
        "text": "alternate id",
        "value": "#(locus/alternate_id)",
        "visible": ".",
        "enabled": true
      }
    },
    "arch_context": {
      "element_type": {
        "isIdentifier": "True",
        "name": "TextField",
        "text": "locus",
        "value": "#(locus/arch_context)",
        "enabled": true
      }
    },
    "arch_domain": {
      "element_type": {
        "name": "TextField",
        "text": "arch domain",
        "value": "#(locus/arch_domain)",
        "enabled": true
      }
    },
    "closing elevations": {
      "element_type": {
        "name": "TextField",
        "text": "closing elevations",
        "value": "#(locus/closing elevations)"
      }
    },
    "colour": {
      "element_type": {
        "name": "TextField",
        "text": "colour",
        "value": "#(locus/colour)",
        "visible": ".",
        "enabled": true
      }
    },
    "created": {
      "element_type": {
        "name": "DateTimeField",
        "text": "created",
        "value": "#(locus/created)",
        "enabled": true
      }
    },
    "date_closed": {
      "element_type": {
        "datetime_format": "date",
        "name": "DateField",
        "text": "date closed",
        "value": "#(locus/date_closed)",
        "enabled": true
      }
    },
    "date_defined": {
      "element_type": {
        "datetime_format": "date",
        "name": "DateField",
        "text": "date defined",
        "value": "#(locus/date_defined)",
        "enabled": true
      }
    },
    "datum_point_elevation": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "datum point elevation",
        "value": "#(locus/datum_point_elevation)",
        "visible": ".",
        "enabled": true
      }
    },
    "depth": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "depth",
        "value": "#(locus/depth)",
        "visible": ".",
        "enabled": true
      }
    },
    "description": {
      "element_type": {
        "multiline": "true",
        "name": "TextField",
        "text": "description",
        "value": "#(locus/description)",
        "enabled": true
      },
      "layout": {
        "min_width": "max"
      }
    },
    "elevation_closing_ct": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation closing ct",
        "value": "#(locus/elevation_closing_ct)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_closing_ne": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation closing ne",
        "value": "#(locus/elevation_closing_ne)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_closing_nw": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation closing nw",
        "value": "#(locus/elevation_closing_nw)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_closing_se": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation closing se",
        "value": "#(locus/elevation_closing_se)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_closing_sw": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation closing sw",
        "value": "#(locus/elevation_closing_sw)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_opening_ct": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation opening ct",
        "value": "#(locus/elevation_opening_ct)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_opening_ne": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation opening ne",
        "value": "#(locus/elevation_opening_ne)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_opening_nw": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation opening nw",
        "value": "#(locus/elevation_opening_nw)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_opening_se": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation opening se",
        "value": "#(locus/elevation_opening_se)",
        "visible": ".",
        "enabled": true
      }
    },
    "elevation_opening_sw": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "elevation opening sw",
        "value": "#(locus/elevation_opening_sw)",
        "visible": ".",
        "enabled": true
      }
    },
    "excavated_with": {
      "element_type": {
        "name": "TextField",
        "text": "excavated with",
        "value": "#(locus/excavated_with)",
        "visible": ".",
        "enabled": true
      }
    },
    "formation_process": {
      "element_type": {
        "name": "TextField",
        "text": "formation process",
        "value": "#(locus/formation_process)",
        "enabled": true
      }
    },
    "id": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "id",
        "value": "#(locus/id)",
        "enabled": true
      }
    },
    "interpretation": {
      "element_type": {
        "multiline": "true",
        "name": "TextField",
        "text": "interpretation",
        "value": "#(locus/interpretation)",
        "enabled": true
      },
      "layout": {
        "min_width": "max"
      }
    },
    "length": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "length",
        "value": "#(locus/length)"
      }
    },
    "modified": {
      "element_type": {
        "name": "DateTimeField",
        "text": "modified",
        "value": "#(locus/modified)",
        "enabled": true
      }
    },
    "modified_by": {
      "element_type": {
        "name": "TextField",
        "text": "modified by",
        "value": "#(locus/modified_by)",
        "enabled": true
      }
    },
    "opening elevations": {
      "element_type": {
        "name": "TextField",
        "text": "opening elevations",
        "value": "#(locus/opening elevations)"
      }
    },
    "recorded_by": {
      "element_type": {
        "name": "TextField",
        "text": "recorded by",
        "value": "#(locus/recorded_by)",
        "enabled": true
      }
    },
    "type": {
      "element_type": {
        "items": {
          "key": "id",
          "lookup_type": "table",
          "selection": [
            "type_name"
          ],
          "topic": "locus_types"
        },
        "name": "selection",
        "text": "locus type",
        "value": "#(locus/type)",
        "visible": "false",
        "enabled": true
      }
    },
    "uid": {
      "element_type": {
        "name": "TextField",
        "text": "uid",
        "value": "#(locus/uid)",
        "enabled": true
      }
    },
    "uid_unit": {
      "element_type": {
        "name": "TextField",
        "text": "uid unit",
        "value": "#(locus/uid_unit)",
        "visible": "false",
        "enabled": true
      }
    },
    "volume": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "volume",
        "value": "#(locus/volume)",
        "visible": ".",
        "enabled": true
      }
    },
    "width": {
      "element_type": {
        "format": "FLOAT",
        "name": "TextField",
        "style": {
          "text-align": "right"
        },
        "text": "width",
        "value": "#(locus/width)",
        "visible": ".",
        "enabled": true
      }
    }
  },
}