ui_schema = {
  "header": {
    "version": 1
  },
  "layout_settings": {
    "orchestration_strategy": "columns",
    "order": [
      "arch_context",
      "id",
      "purpose",
      "uid_site_map"
    ]
  },
  "ui_elements": {
    "arch_context": {
      "element_type": {
        "isIdentifier": "True",
        "name": "TextField",
        "text": "site id",
        "value": "#(site/arch_context)",
        "enabled": true,
        "readonly": true
      }
    },
    "uid_site_map": {
      "element_type": {
        // "file_description": "bottom",
        "name": "File",
        "resolution": "small",
        "text": "site map",
        "value": "#(site/uid_site_map)",
        "enabled": true,
        "align_image": "center",
        "fit_content": "scale"
      },
      "layout": {
        "min_width": "max"
      }
    },
    "arch_domain": {
      "element_type": {
        "name": "TextField",
        "text": "arch domain",
        "value": "#(site/arch_domain)",
        "enabled": true
      }
    },
    "created": {
      "element_type": {
        "name": "DateTimeField",
        "text": "created",
        "value": "#(site/created)",
        "enabled": true
      }
    },
    "id": {
      "element_type": {
        "name": "TextField",
        "text": "name of site",
        "value": "#(site/id)",
        "enabled": true,
        "readonly": true
      }
    },
    "id_short": {
      "element_type": {
        "name": "TextField",
        "text": "id short",
        "value": "#(site/id_short)",
        "enabled": true
      }
    },
    "modified": {
      "element_type": {
        "name": "DateTimeField",
        "text": "modified",
        "value": "#(site/modified)",
        "enabled": true
      }
    },
    "modified_by": {
      "element_type": {
        "name": "TextField",
        "text": "modified by",
        "value": "#(site/modified_by)",
        "enabled": true
      }
    },
    "purpose": {
      "element_type": {
        "multiline": "true",
        "name": "TextField",
        "text": "purpose",
        "value": "#(site/purpose)",
        "enabled": true,
        "readonly": true
      },
      "layout": {
        "min_width": "max"
      }
    },
    "uid": {
      "element_type": {
        "name": "TextField",
        "text": "uid",
        "value": "#(site/uid)",
        "enabled": true
      }
    }
  },
}