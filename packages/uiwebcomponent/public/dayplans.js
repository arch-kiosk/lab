ui_schema = {
  "header": {
    "version": 1
  },
  "layout_settings": {
    "allow_ordering_by": [
      "modified",
      "modified_by"
    ],
    "orchestration_strategy": "gallery",
    "order": [
      "uid_image",
      "modified"
    ],
    "order_records_by": [
      ">modified",
      "modified_by"
    ],
    "type": "list"
  },
  "ui_elements": {
    "created": {
      "element_type": {
        "name": "DateTimeField",
        "text": "created",
        "value": "#(dayplan/created)",
        "enabled": true
      }
    },
    "image_description": {
      "element_type": {
        "name": "TextField",
        "text": "image description",
        "value": "#(dayplan/image_description)",
        "enabled": true
      }
    },
    "modified": {
      "element_type": {
        "name": "DateTimeField",
        "text": "modified",
        "value": "#(dayplan/modified)",
        "enabled": true,
        "readonly": true
      }
    },
    "modified_by": {
      "element_type": {
        "name": "TextField",
        "text": "modified by",
        "value": "#(dayplan/modified_by)",
        "enabled": true
      }
    },
    "uid": {
      "element_type": {
        "name": "TextField",
        "text": "uid",
        "value": "#(dayplan/uid)",
        "enabled": true
      }
    },
    "uid_image": {
      "element_type": {
        "file_description": "bottom",
        "fit_content": "fit",
        "name": "File",
        "resolution": "small",
        "text": "uid image",
        "value": "#(dayplan/uid_image)",
        "enabled": true,
        "readonly": true
      },
      "layout": {
        "min_height": "max",
        "min_width": "max"
      }
    },
    "uid_unit": {
      "element_type": {
        "name": "TextField",
        "text": "uid unit",
        "value": "#(dayplan/uid_unit)",
        "enabled": true
      }
    }
  },
}