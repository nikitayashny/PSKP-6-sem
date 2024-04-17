let openapi = {
    openapi: '3.0.1',
    paths: {
        '/ts': {
            get: {
                tags: ['CRUD'],
                description: 'Get phonebooks dictionary',
                operationId: 'getTS',
                responses: {
                    '200': {
                        description: 'All phonebooks list',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                                example:
                                    [{
                                        'number': '+375291234567',
                                        'name': 'John Doe'
                                    },
                                    {
                                        'number': '+375339876543',
                                        'name': 'Jane Doe'
                                    },
                                    ]
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['CRUD'],
                description: 'Add phonebook to dictionary',
                operationId: 'postTS',
                requestBody: {
                    content: {
                        'application/json': {
                            name: 'Dictionary line',
                            schema: { type: 'object' },
                            required: true,
                            description: 'Post data for dictionary',
                            example:
                            {
                                'number': '+375291234567',
                                'name': 'John Doe'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Create phonebook message',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                                example: {
                                    message: '[OK] Succesfully added phonebook.'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Missing parameters message',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                                example: {
                                    message: '[ERROR] 400: Invalid parameters.'
                                }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['CRUD'],
                description: 'Update phonebook in dictionary',
                operationId: 'putTS',
                requestBody: {
                    content: {
                        'application/json': {
                            name: 'Dictionary line',
                            schema: { type: 'object' },
                            required: true,
                            description: 'Put data for dictionary',
                            example:
                            {
                                'number': '+3752912345671',
                                'name': 'John Doe'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Updated phonebook message',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                                example: {
                                    message: '[OK] Succesfully updated phonebook.'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Missing parameters message',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                                example: {
                                    message: '[ERROR] 400: Invalid parameters.'
                                }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ['CRUD'],
                description: 'Delete phonebook from dictionary',
                operationId: 'delTS',
                parameters: [
                    {
                        name: 'name',
                        in: 'query',
                        schema: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 15
                        },
                        required: true,
                        description: 'Number in dictionary for delete'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Deleted phonebook message',
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                                example: {
                                    message: '[OK] Succesfully deleted phonebook.'
                                }
                            }
                        }
                    }

                }
            }
        }
    }
};

module.exports = openapi;