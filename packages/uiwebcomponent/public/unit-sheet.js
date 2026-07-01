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
        "orchestration_strategy": "columns",
        readonly: true,
        order: ["id_site","arch_context", "line", "legacy_unit_id", "..."],
        default_element_visibility: "."
    },
    ui_elements:{
        "at_asnde_no": {
            "element_type": {
                "name": "TextField",
                "text": "at asnde no",
                "value": "#(u2ers_sites/at_asnde_no)",
                "readonly": true
            }
        },
        "at_condition": {
            "element_type": {
                "name": "TextField",
                "text": "at condition",
                "value": "#(u2ers_sites/at_condition)",
                "readonly": true
            }
        },
        "at_dated_as": {
            "element_type": {
                "name": "TextField",
                "text": "at dated as",
                "value": "#(u2ers_sites/at_dated_as)",
                "readonly": true
            }
        },
        "at_geometry": {},
        "at_governorate": {
            "element_type": {
                "name": "TextField",
                "text": "at governorate",
                "value": "#(u2ers_sites/at_governorate)"
            }
        },
        "at_reference": {
            "element_type": {
                "name": "TextField",
                "text": "at reference",
                "value": "#(u2ers_sites/at_reference)"
            }
        },
        "created": {
            "element_type": {
                "name": "DateTimeField",
                "text": "created",
                "value": "#(u2ers_sites/created)"
            }
        },
        "g_earth_damage_cause": {
            "element_type": {
                "name": "TextField",
                "text": "recent damage cause",
                "value": "#(u2ers_sites/g_earth_damage_cause)"
            }
        },
        "g_earth_general_condition": {
            "element_type": {
                "name": "TextField",
                "text": "recent general condition",
                "value": "#(u2ers_sites/g_earth_general_condition)"
            }
        },
        "line_1": {
            "element_type": {
                "name": "line",
                "transparent": true,
                "visible": true,
                "enabled": true,
                "readonly": true
            },
            "layout": {
                "min_width": "max"
            }
        },
        "line_2": {
            "element_type": {
                "name": "line",
                "transparent": true,
                "visible": true,
                "enabled": true
            },
            "layout": {
                "min_width": "max"
            }
        },
        "modified": {
            "dummy": {

            },
            "element_type": {
                "name": "DateTimeField",
                "text": "modified",
                "value": "#(u2ers_sites/modified)"
            }
        },
        "modified_by": {
            "element_type": {
                "name": "TextField",
                "text": "modified by",
                "value": "#(u2ers_sites/modified_by)"
            }
        },
        "qc_state": {
            "element_type": {
                "name": "TextField",
                "text": "state of record",
                "value": "#(u2ers_sites/qc_state)"
            }
        },
        "site_id": {
            "element_type": {
                "is_identifier": true,
                "name": "TextField",
                "text": "site id",
                "value": "#(u2ers_sites/site_id)",
                "readonly": true
            }
        },
        "site_name": {
            "somthin": {},
            "element_type": {
                "name": "TextField",
                "text": "site name",
                "value": "#(u2ers_sites/site_name)",
                "readonly": true
            }
        },
        "u2_benefit_over_corona": {
            "element_type": {
                "name": "TextField",
                "text": "u2 advantages",
                "value": "#(u2ers_sites/u2_benefit_over_corona)"
            }
        },
        "u2_better_site_preservation": {
            "element_type": {
                "name": "TextField",
                "text": "u2 better than corona?",
                "value": "#(u2ers_sites/u2_better_site_preservation)",
                "readonly": true
            }
        },
        "u2_images_showing_the_site": {
            "element_type": {
                "name": "TextField",
                "text": "u2 images showing the site",
                "value": "#(u2ers_sites/u2_images_showing_the_site)",
                "readonly": true
            }
        },
        "uid": {
            "element_type": {
                "name": "TextField",
                "text": "uid",
                "value": "#(u2ers_sites/uid)",
                "visible": false
            }
        },
        "visible_in_corona": {
            "element_type": {
                "name": "TextField",
                "text": "site on Corona?",
                "value": "#(u2ers_sites/visible_in_corona)",
                "readonly": true
            }
        },
        "visible_in_u2": {
            "element_type": {
                "name": "TextField",
                "text": "site on U2?",
                "value": "#(u2ers_sites/visible_in_u2)",
                "readonly": true
            }
        }
    },
}
