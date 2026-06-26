ui_schema = {
    "header": {
    "version": 1
},
    "dsd": {
    "collected_material": {
        "analysis_method": [
            "datatype(VARCHAR)"
        ],
            "arch_context": [
            "datatype(VARCHAR)",
            "identifier()",
            "label(#(/$/constants/labels/label_bulk_number))"
        ],
            "arch_domain": [
            "datatype(VARCHAR)",
            "id_domain(\"arch_context\")"
        ],
            "cm_type": [
            "datatype(VARCHAR)",
            "label(type)"
        ],
            "collection_method": [
            "datatype(VARCHAR)"
        ],
            "coord_x": [
            "datatype(FLOAT)"
        ],
            "coord_y": [
            "datatype(FLOAT)"
        ],
            "coord_z": [
            "datatype(FLOAT)"
        ],
            "created": [
            "datatype(TIMESTAMP)",
            "replfield_created()"
        ],
            "date": [
            "datatype(TIMESTAMP)"
        ],
            "dearregistrar": [
            "datatype(VARCHAR)"
        ],
            "description": [
            "datatype(VARCHAR)",
            "record_description()"
        ],
            "external_id": [
            "datatype(VARCHAR)",
            "identifier(\"additional\")"
        ],
            "id": [
            "datatype(NUMBER)",
            "local_id(\"arch_context\")"
        ],
            "is_grave_good": [
            "datatype(NUMBER)"
        ],
            "isobject": [
            "datatype(NUMBER)"
        ],
            "modified": [
            "datatype(TIMESTAMP)",
            "replfield_modified()"
        ],
            "modified_by": [
            "datatype(VARCHAR)",
            "replfield_modified_by()",
            "default(null)"
        ],
            "number_of_bags": [
            "datatype(int)"
        ],
            "period": [
            "datatype(VARCHAR)"
        ],
            "pottery_remarks": [
            "datatype(VARCHAR)"
        ],
            "quantity": [
            "datatype(DECIMAL)",
            "default(0)"
        ],
            "status_done": [
            "datatype(VARCHAR)"
        ],
            "status_todo": [
            "datatype(VARCHAR)"
        ],
            "storage": [
            "datatype(VARCHAR)"
        ],
            "type": [
            "datatype(VARCHAR)",
            "label(material)"
        ],
            "uid": [
            "datatype(UUID)",
            "replfield_uuid()"
        ],
            "uid_locus": [
            "datatype(UUID)",
            "join(\"locus\")"
        ],
            "uid_lot": [
            "datatype(UUID)"
        ],
            "volume": [
            "datatype(DECIMAL)",
            "default(0)"
        ],
            "weight": [
            "datatype(DECIMAL)",
            "default(0)"
        ]
    },
    "collected_material_photo": {
        "created": [
            "datatype(TIMESTAMP)",
            "replfield_created()"
        ],
            "description": [
            "datatype(VARCHAR)",
            "describes_file(uid_photo)"
        ],
            "modified": [
            "datatype(TIMESTAMP)",
            "replfield_modified()"
        ],
            "modified_by": [
            "datatype(VARCHAR)",
            "replfield_modified_by()",
            "default(null)"
        ],
            "uid": [
            "datatype(UUID)",
            "replfield_uuid()"
        ],
            "uid_cm": [
            "datatype(UUID)",
            "join(\"collected_material\")"
        ],
            "uid_photo": [
            "datatype(UUID)",
            "uid_file()",
            "file_location_for(\"collected_material\")"
        ]
    },
    "locus": {
        "alternate_id": [
            "datatype(VARCHAR)",
            "identifier(\"additional\")",
            "skip_index_on(\"hidden\")"
        ],
            "arch_context": [
            "datatype(VARCHAR)",
            "identifier()",
            "skip_index_on(\"hidden\")",
            "label(\"locus\")"
        ],
            "arch_domain": [
            "datatype(VARCHAR)",
            "id_domain(\"arch_context\")"
        ],
            "closing elevations": [
            "datatype(VARCHAR)"
        ],
            "colour": [
            "datatype(VARCHAR)"
        ],
            "created": [
            "datatype(TIMESTAMP)",
            "replfield_created()"
        ],
            "date_closed": [
            "datatype(DATE)",
            "label(\"closing date\")"
        ],
            "date_defined": [
            "datatype(DATE)",
            "label(\"opening date\")"
        ],
            "datum_point_elevation": [
            "datatype(FLOAT)"
        ],
            "depth": [
            "datatype(FLOAT)"
        ],
            "description": [
            "datatype(VARCHAR)",
            "record_description()"
        ],
            "elevation_closing_ct": [
            "datatype(FLOAT)"
        ],
            "elevation_closing_ne": [
            "datatype(FLOAT)"
        ],
            "elevation_closing_nw": [
            "datatype(FLOAT)"
        ],
            "elevation_closing_se": [
            "datatype(FLOAT)"
        ],
            "elevation_closing_sw": [
            "datatype(FLOAT)"
        ],
            "elevation_opening_ct": [
            "datatype(FLOAT)"
        ],
            "elevation_opening_ne": [
            "datatype(FLOAT)"
        ],
            "elevation_opening_nw": [
            "datatype(FLOAT)"
        ],
            "elevation_opening_se": [
            "datatype(FLOAT)"
        ],
            "elevation_opening_sw": [
            "datatype(FLOAT)"
        ],
            "excavated_with": [
            "datatype(VARCHAR)"
        ],
            "formation_process": [
            "datatype(VARCHAR)"
        ],
            "id": [
            "datatype(NUMBER)",
            "local_id(\"arch_context\")"
        ],
            "interpretation": [
            "datatype(VARCHAR)"
        ],
            "length": [
            "datatype(FLOAT)"
        ],
            "modified": [
            "datatype(TIMESTAMP)",
            "replfield_modified()"
        ],
            "modified_by": [
            "datatype(VARCHAR)",
            "replfield_modified_by()",
            "default(null)"
        ],
            "opening elevations": [
            "datatype(VARCHAR)"
        ],
            "recorded_by": [
            "datatype(VARCHAR)",
            "default(null)"
        ],
            "type": [
            "datatype(VARCHAR)",
            "label('locus type')",
            "lookup('locus_types', 'id')"
        ],
            "uid": [
            "datatype(UUID)",
            "replfield_uuid()"
        ],
            "uid_unit": [
            "datatype(UUID)",
            "join(\"unit\")"
        ],
            "volume": [
            "datatype(FLOAT)"
        ],
            "width": [
            "datatype(FLOAT)"
        ]
    },
    "site": {
        "arch_context": [
            "datatype(VARCHAR)",
            "identifier()",
            "label(\"site\")"
        ],
            "arch_domain": [
            "datatype(VARCHAR)",
            "id_domain(\"arch_context\")"
        ],
            "created": [
            "datatype(TIMESTAMP)",
            "replfield_created()"
        ],
            "id": [
            "datatype(VARCHAR)",
            "label(\"name of site\")"
        ],
            "id_short": [
            "datatype(VARCHAR)",
            "local_id(\"arch_context\")"
        ],
            "modified": [
            "datatype(TIMESTAMP)",
            "replfield_modified()"
        ],
            "modified_by": [
            "datatype(VARCHAR)",
            "replfield_modified_by()",
            "default(null)"
        ],
            "purpose": [
            "datatype(VARCHAR)"
        ],
            "uid": [
            "datatype(UUID)",
            "replfield_uuid()"
        ],
            "uid_site_map": [
            "datatype(UUID)",
            "uid_file()",
            "label(\"site map\")"
        ]
    },
    "small_find": {
        "colour": [
            "datatype(VARCHAR)"
        ],
            "condition": [
            "datatype(VARCHAR)"
        ],
            "cost": [
            "datatype(DECIMAL)"
        ],
            "created": [
            "datatype(TIMESTAMP)",
            "replfield_created()"
        ],
            "description": [
            "datatype(VARCHAR)"
        ],
            "diameter": [
            "datatype(VARCHAR)"
        ],
            "external_id": [
            "datatype(VARCHAR)"
        ],
            "height": [
            "datatype(VARCHAR)"
        ],
            "id_registrar": [
            "datatype(VARCHAR)"
        ],
            "length": [
            "datatype(VARCHAR)"
        ],
            "material": [
            "datatype(VARCHAR)"
        ],
            "measured_in_situ": [
            "datatype(NUMBER)"
        ],
            "modified": [
            "datatype(TIMESTAMP)",
            "replfield_modified()"
        ],
            "modified_by": [
            "datatype(VARCHAR)",
            "replfield_modified_by()",
            "default(null)"
        ],
            "period": [
            "datatype(VARCHAR)"
        ],
            "smallfindsnr": [
            "datatype(NUMBER)"
        ],
            "thickness": [
            "datatype(VARCHAR)"
        ],
            "uid": [
            "datatype(UUID)",
            "replfield_uuid()"
        ],
            "uid_cm": [
            "datatype(UUID)",
            "join(\"collected_material\")"
        ],
            "weight": [
            "datatype(VARCHAR)"
        ],
            "width": [
            "datatype(VARCHAR)"
        ]
    },
    "unit": {
        "arch_context": [
            "datatype(VARCHAR)",
            "identifier()",
            "label(\"#(unit/term_for_unit)\")"
        ],
            "arch_domain": [
            "datatype(VARCHAR)",
            "id_domain(\"arch_context\")",
            "label(\"domain\")"
        ],
            "coordinates": [
            "datatype(VARCHAR)"
        ],
            "created": [
            "datatype(TIMESTAMP)",
            "replfield_created()"
        ],
            "excavator_full_name": [
            "datatype(VARCHAR)"
        ],
            "id": [
            "datatype(NUMBER)",
            "local_id(\"arch_context\")"
        ],
            "id_excavator": [
            "datatype(VARCHAR)",
            "label(\"#($/constants/labels/label_supervisor)\")"
        ],
            "id_site": [
            "datatype(VARCHAR)",
            "join(\"site\",\"id\")",
            "label(\"site\")"
        ],
            "identification_method_analysis": [
            "datatype(VARCHAR)"
        ],
            "identification_method_cm": [
            "datatype(VARCHAR)"
        ],
            "identification_method_loci": [
            "datatype(VARCHAR)"
        ],
            "legacy_unit_id": [
            "datatype(VARCHAR)"
        ],
            "method": [
            "datatype(VARCHAR)",
            "label(\"recording method\")"
        ],
            "modified": [
            "datatype(TIMESTAMP)",
            "replfield_modified()"
        ],
            "modified_by": [
            "datatype(VARCHAR)",
            "replfield_modified_by()",
            "default(null)"
        ],
            "name": [
            "datatype(VARCHAR)"
        ],
            "purpose": [
            "datatype(VARCHAR)"
        ],
            "spider_counter": [
            "datatype(NUMBER)"
        ],
            "term_for_locus": [
            "datatype(VARCHAR)"
        ],
            "term_for_unit": [
            "datatype(VARCHAR)"
        ],
            "type": [
            "datatype(VARCHAR)"
        ],
            "uid": [
            "datatype(UUID)",
            "replfield_uuid()"
        ],
            "unit_creation_date": [
            "datatype(DATE)",
            "label(\"opened on\")"
        ]
    }
},
    "layout_settings": {
    "default_element_visibility": true,
        "orchestration_strategy": "columns",
        "order": [
        "external_id",
        "line_1",
        "length",
        "modified_by",
        "modified",
        "created",
        "uid"
    ],
        "readonly": true
},
    "meta": {
    "scenario": "view"
},
    "ui_elements": {
    "colour": {
        "element_type": {
            "name": "TextField",
                "text": "colour",
                "value": "#(small_find/colour)"
        }
    },
    "condition": {
        "element_type": {
            "name": "TextField",
                "text": "condition",
                "value": "#(small_find/condition)"
        }
    },
    "cost": {
        "element_type": {
            "format": "FLOAT",
                "name": "TextField",
                "style": {
                "text-align": "right"
            },
            "text": "cost",
                "value": "#(small_find/cost)"
        }
    },
    "created": {
        "element_type": {
            "name": "DateTimeField",
                "text": "created",
                "value": "#(small_find/created)"
        }
    },
    "description": {
        "element_type": {
            "name": "TextField",
                "text": "description",
                "value": "#(small_find/description)"
        }
    },
    "diameter": {
        "element_type": {
            "name": "TextField",
                "text": "diameter",
                "value": "#(small_find/diameter)"
        }
    },
    "external_id": {
        "element_type": {
            "name": "TextField",
                "text": "external id",
                "value": "#(small_find/external_id)"
        }
    },
    "height": {
        "element_type": {
            "name": "TextField",
                "text": "height",
                "value": "#(small_find/height)"
        }
    },
    "id_registrar": {
        "element_type": {
            "name": "TextField",
                "text": "id registrar",
                "value": "#(small_find/id_registrar)"
        }
    },
    "length": {
        "element_type": {
            "name": "TextField",
                "text": "length",
                "value": "#(small_find/length)"
        }
    },
    "line_1": {
        "element_type": {
            "name": "line",
                "transparent": false,
                "visible": true
        },
        "layout": {
            "min_width": "max"
        }
    },
    "material": {
        "element_type": {
            "name": "TextField",
                "text": "material",
                "value": "#(small_find/material)"
        }
    },
    "measured_in_situ": {
        "element_type": {
            "format": "FLOAT",
                "name": "TextField",
                "style": {
                "text-align": "right"
            },
            "text": "measured in situ",
                "value": "#(small_find/measured_in_situ)"
        }
    },
    "modified": {
        "element_type": {
            "name": "DateTimeField",
                "text": "modified",
                "value": "#(small_find/modified)"
        }
    },
    "modified_by": {
        "element_type": {
            "name": "TextField",
                "text": "modified by",
                "value": "#(small_find/modified_by)"
        }
    },
    "period": {
        "element_type": {
            "name": "TextField",
                "text": "period",
                "value": "#(small_find/period)"
        }
    },
    "smallfindsnr": {
        "element_type": {
            "format": "FLOAT",
                "name": "TextField",
                "style": {
                "text-align": "right"
            },
            "text": "smallfindsnr",
                "value": "#(small_find/smallfindsnr)"
        }
    },
    "thickness": {
        "element_type": {
            "name": "TextField",
                "text": "thickness",
                "value": "#(small_find/thickness)"
        }
    },
    "uid": {
        "element_type": {
            "name": "TextField",
                "text": "uid",
                "value": "#(small_find/uid)",
                "visible": false
        }
    },
    "uid_cm": {
        "element_type": {
            "name": "TextField",
                "text": "uid cm",
                "value": "#(small_find/uid_cm)",
                "visible": false
        }
    },
    "weight": {
        "element_type": {
            "name": "TextField",
                "text": "weight",
                "value": "#(small_find/weight)"
        }
    },
    "width": {
        "element_type": {
            "name": "TextField",
                "text": "width",
                "value": "#(small_find/width)"
        }
    }
}
}