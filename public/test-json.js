ui_schema = {
    "header": {
        "version": 1
    },
    "meta": {
        "scenario": "query input"
    },
    "dsd": {
        "selectn0": [
            "datatype(varchar)"
        ],
        "context_id": [
            "datatype(varchar), identifier()"
        ],
        "context_id_2": [
            "datatype(varchar), identifier()"
        ],
        "text_filter": [
            "datatype(varchar)"
        ],
        "modified": [
            "datatype(datetime)"
        ],
        "created": [
            "datatype(datetime)"
        ]

    },
    "layout_settings": {
        "readonly": false,
        "orchestration_strategy": "stack",
    },
    "ui_elements": {
        "n0": {
            "binding": {
                "field_name": "selectn0"
            },
            "layout": {
                "min_width": "2",
            },
            "element_type": {
                "name": "Selection",
                "text": "context-id",
                "is_identifier": true,
                "readonly": false,
                "items": [["ac", "Architecture"],["dp", "Deposit"],["bu", "Burial"]]
            }
        },
        "l0": {
            "element_type": {
                "name": "layout",
                "layout": {
                    "padding": {
                        "top": ".5em",
                        "right": ".5em",
                        "bottom": "1em",
                        "left": ".5em",
                    }
                },
                "layout_settings": {
                    "orchestration_strategy": "columns",
                    readonly: false
                },
                "ui_elements": {
                    "e0": {
                        "binding": {
                            "field_name": "context_id"
                        },
                        "layout": {
                            "min_width": "2",
                        },
                        "element_type": {
                            "name": "Selection",
                            "text": "context-id",
                            "is_identifier": true,
                            "readonly": false,
                            "items": {
                                "topic": "locus",
                                "selection": ['type'],
                                "key": "type"
                            }
                        }
                    },
                    "e1": {
                        "binding": {
                            "field_name": "context_id_2"
                        },
                        "layout": {
                            "min_width": "2",
                        },
                        "element_type": {
                            "name": "Selection",
                            "text": "context-id",
                            "is_identifier": true,
                            "items": {
                                "topic": "locus",
                                "selection": ['type'],
                                "key": "type"
                            }
                        }
                    },
                    "e2": {
                        "binding": {
                            "field_name": "text_filter"
                        },
                        "layout": {
                            "min_width": "max"
                        },
                        "element_type": {
                            "name": "TextField",
                            "value": "${e2}",
                            "text": "text filter",
                            "readonly": false,
                            "style": {
                                "classes": "light-background",
                                "text-align": "right"
                            }
                        }
                    },
                    "e3": {
                        "binding": {
                            "field_name": "modified"
                        },
                        "layout": {
                            "min_width": 2
                        },
                        "element_type": {
                            "name": "DateField",
                            "readonly": false,
                            "text": "date field",
                            "value": "${e3}"
                        },
                    },
                    "e4": {
                        "binding": {
                            "field_name": "created"
                        },
                        "layout": {
                            "min_width": 2
                        },
                        "element_type": {
                            "name": "DateTimeField",
                            "text": "date time field",
                            "readonly": false,
                            "value": "${e4}"},
                    },
                    "e5template": {
                        "layout": {
                            "min_width": 2,
                            "padding": {
                                "top": "1em",
                                "bottom": "0",
                                "left": "0",
                                "right": "0",
                            }
                        },
                        "element_type": {
                            "name": "TemplateLabel",
                            "value": "${e5TemplateLabel}",
                            "style": {
                                "classes": "light-background",
                                "text-align": "center"
                            }
                        }
                    },
                    "myBool": {
                        "binding": {
                            "field_name": "myBool"
                        },
                        "layout": {
                            "min_width": 1
                        },
                        "element_type": {
                            "name": "Bool",
                            "readonly": false,
                            "value": "${myBool}",
                            "text": "a boolean"
                        }
                    }
                }
            }
        },
        "e5": {
            "element_type": {
                "name": "line",
                "padding": 0
            }
        },
        "e6": {
            "element_type": {
                "name": "layout",
                "layout": {
                  "padding": ".5em"
                },
                "layout_settings": {
                    "orchestration_strategy": "RightAlign",
                },
                "ui_elements": {
                    "e7": {
                        "element_type": {
                            "name": "Button",
                            "type": "cancelButton",
                            "default": "CANCEL"
                        }
                    },
                    "e8": {
                        "element_type": {
                            "name": "Button",
                            "type": "okButton"
                        }
                    },
                    "e9": {
                        "element_type": {
                            "name": "Button",
                            "type": "iconButton",
                            "icon": "",
                            "default": "ENTER",
                            "extra_style": "padding-left:5px"
                        }
                    }
                }
            }
        }
    }
}
