ui_schema = {
  "header": {
    "version": 1
  },
  "layout_settings": {
    "orchestration_strategy": "stack",
    // "order": [
    //   "to_date",
    //   "from_date",
    // ],
    // "order_records_by": [
    //   // ">modified"
    // ],
    // "type": "list"
  },
  "ui_elements": {
    "to_date": {
      "binding": {
        "field_name": "to_date"
      },
      "element_type": {
        "datetime_format": "date",
        "name": "DateField",
        "text": "to"
      }
    },
    "from_date": {
      "binding": {
        "field_name": "from_date"
      },
      "element_type": {
        "datetime_format": "date",
        "name": "DateField",
        "text": "from"
      }
    },
    "zzz_date": {
      // "binding": {
      //   "field_name": "zzz_date"
      // },
      "element_type": {
        "datetime_format": "date",
        "name": "DateField",
        "text": "zzz"
      }
    },
    "zzz2_date": {
      // "binding": {
      //   "field_name": "zzz2_date"
      // },
      "element_type": {
        "datetime_format": "date",
        "name": "DateField",
        "text": "zzz2"
      }
    },

  },
}