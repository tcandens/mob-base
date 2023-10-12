# Rough flow for synchronizing and loading data

1. Browser application loads
2. Store checks IndexedDB for cached data.
    a. If cache exists, pushes data to store.
3. Mark store ready for synchronizing.
4. Send 'sync' message to server which contains the following:
    a. timestamp of the most recent

5. When an entity is created or updated.
    a. a patch is sent to the sync server.
        aa. patch is assigned a uuid with timestamp.
    b. the patch is translated to a transaction to persist in database.
    c. the server tracks the timestamp of the last processed patch / transaction.
        cc. if the patch sent is before the last processed patch, nothing happens.

