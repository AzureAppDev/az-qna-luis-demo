const { CosmosClient, DatabaseDefinition, ContainerDefinition, 
    CosmosClientOptions, Database, Container } = require("@azure/cosmos");

class CosmosRepository {
    cosmosDbClient = null;

    databaseDef = null;
    containerDef = null

    database = null;
    container = null;

    constructor(options, databaseDef, containerDef) {
        this.cosmosDbClient = new CosmosClient(options);
        this.databaseDef = databaseDef;
        this.containerDef = containerDef;
    }

    async ConnectToCollection() {
        try {
            const databaseResponse = await this.cosmosDbClient.databases.createIfNotExists(this.databaseDef);
            if (databaseResponse) {
                this.database = databaseResponse.database;
                const containerResponse = await this.database.containers.createIfNotExists(this.containerDef);
                if (containerResponse) {
                    this.container = containerResponse.container;
                } else {
                    throw new Error(`ERROR: Collection Response is Falsy`);
                }
            } else {
                throw new Error(`ERROR: Database Response is Falsy`)
            }
        } catch(error) {
            throw new Error(`ERROR: Connecting to Azure CosmosDb | ${error.code} | ${error.message}`);
        }
    }

    async GetItem(id) {
        const querySpec = {
            query: "SELECT * from c WHERE c.id = \"" + id + "\""
        };
        return await this.container.items.query(querySpec).fetchAll();
    }
}

function CosmosRepositoryInitializer() {

    if (!process.env.COSMOS_ENDPOINT) {
        throw new Error("Missing: process.env.COSMOS_ENDPOINT")
    }

    if (!process.env.COSMOS_PRIMARY_KEY) {
        throw new Error("Missing: process.env.COSMOS_PRIMARY_KEY")
    }

    if (!process.env.COSMOS_SECONDARY_KEY) {
        throw new Error("Missing: process.env.COSMOS_SECONDARY_KEY")
    }

    if (!process.env.COSMOS_DATABASE_NAME) {
        throw new Error("Missing: process.env.COSMOS_DATABASE_NAME")
    }

    if (!process.env.COSMOS_COLLECTION_NAME) {
        throw new Error("Missing: process.env.COSMOS_COLLECTION_NAME")
    }

    const _endpoint = process.env.COSMOS_ENDPOINT;
    const _primaryKey = process.env.COSMOS_PRIMARY_KEY;
    const _secondaryKey = process.env.COSMOS_SECONDARY_KEY;
    const _databaseDef = { id: process.env.COSMOS_DATABASE_NAME };
    const _containerDef = { id: process.env.COSMOS_COLLECTION_NAME };

    let _setKey = _primaryKey;

    const cosmosDbClientOptions = {
        endpoint: _endpoint,
        key: _setKey
    };

    return new CosmosRepository(cosmosDbClientOptions, _databaseDef, _containerDef);
}

module.exports.CosmosRepositoryInitializer = CosmosRepositoryInitializer;
module.exports.CosmosRepository = CosmosRepository;
