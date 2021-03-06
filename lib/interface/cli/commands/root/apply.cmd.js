const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const apply = new Command({
    root: true,
    command: 'patch',
    cliDocs: {
        description: 'Patch a resource by filename or stdin',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = apply;
