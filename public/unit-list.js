ui_schema = {
    "header": {
        "version": 1
    },
    "meta": {
        "scenario": "query input"
    },
    "dsd": {
        "arch_context": [
            "datatype(VARCHAR)",
            "identifier()",
            "label(\"unit\")"
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
            "datatype(VARCHAR)"
        ],
        "id_site": [
            "datatype(VARCHAR)",
            "join(\"site\",\"id\")"
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
            "datatype(VARCHAR)"
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
            "datatype(DATE)"
        ]
    },
    "layout_settings": {
        "type": "list",
        "orchestration_strategy": "table",
        "readonly": true,
        "order": ["arch_context", "type", "id_excavator", "unit_creation_date"],
        "order_records_by": [">arch_context", "type", "id_excavator"],
        "allow_ordering_by": []
    },
    ui_elements:
        {
        "arch_context": {
            "layout": {
                "min_width": "28%"
            },
            "element_type": {
                "is_identifier": true,
                "items": {
                    "key": "arch_context",
                    "lookup_type": "table",
                    "selection": [
                        "arch_context"
                    ],
                    "topic": "unit"
                },
                "name": "TextField",
                "text": "#(unit/term_for_unit)",
                "value": "#(unit/arch_context)"
            }
        },
        "dumb": {
        },
        "id_excavator": {
            "layout": {
                "min_width": "max"
            },
            "element_type": {
                "name": "TemplateLabel",
                "text": "id_excavator",
                "value": "#(unit/id_excavator)"
            }
        },
        "type": {
            "layout": {
                "min_width": "20%"
            },
            "element_type": {
                "name": "TextField",
                "text": "type",
                "value": "#(unit/type)"
            }
        },
        "uid": {
            "layout": {
                "min_width": "28%"
            },
            "element_type": {
                "name": "TextField",
                "text": "uid",
                "value": "#(unit/uid)",
                "visible" : "false"
            }
        },
        "unit_creation_date": {
            "layout": {
                "min_width": "20%"
            },
            "element_type": {
                "datetime_format": "date",
                "name": "TextField",
                "text": "unit_creation_date",
                "value": "#(unit/unit_creation_date)"
            }
        }
    },
}
