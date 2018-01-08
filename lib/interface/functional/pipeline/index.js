require('debug')('codefresh:functional:functions:pipeline');
const _ = require('lodash');
const CFError = require('cf-errors');
const { pipeline } = require('../../../logic/index').api;
const DEFAULTS = require('../defaults');

//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const getPipelineById = async (pipelineId) => {
    if (!pipelineId) {
        throw new CFError('pipelineId must be provided');
    }

    return pipeline.getPipelineById(pipelineId);
};

const getPipelineByRepoAndName = async (repoOwner, repoName, pipelineName) => {
    if (!repoOwner) {
        throw new CFError('repoOwner must be provided');
    }
    if (!repoName) {
        throw new CFError('repoName must be provided');
    }
    if (!pipelineName) {
        throw new CFError('pipelineName must be provided');
    }

    return pipeline.getPipelineByNameAndRepo(pipelineName, repoOwner, repoName);
};

const getPipelinesByRepo = async (
    repoOwner,
    repoName,
    filterByIds = [],
    limit = DEFAULTS.GET_LIMIT_RESULTS,
    page = DEFAULTS.GET_PAGINATED_PAGE,
) => {
    if (!repoOwner) {
        throw new CFError('repoOwner must be provided');
    }
    if (!repoName) {
        throw new CFError('repoName must be provided');
    }

    return pipeline.getAllByRepo({
        repoOwner,
        repoName,
        name: filterByIds,
        limit,
        page,
    });
};

const getAllPipelines = async (
    filterByIds = [],
    limit = DEFAULTS.GET_LIMIT_RESULTS,
    page = DEFAULTS.GET_PAGINATED_PAGE,
) => pipeline.getAll({
    name: filterByIds,
    limit,
    page,
});

const applyPipelineById = async (
    pipelineId,
    contextsDict,
    engineCluster,
    engineNamespace,
    defaultEngine,
) => {
    if (!pipelineId) {
        throw new CFError('pipelineId must be provided');
    }

    const pipelineToUpdate = {};
    pipelineToUpdate.contexts = _.map(contextsDict, (name, type) => ({
        type,
        name,
    }));

    if (engineCluster && engineNamespace) {
        pipelineToUpdate.clusterProvider = {
            active: true,
            selector: engineCluster,
            namespace: engineNamespace,
        };
    }

    if (defaultEngine) {
        _.merge(pipelineToUpdate, {
            clusterProvider: {
                active: false,
            },
        });
    }

    return pipeline.patchPipelineById(pipelineId, pipelineToUpdate);
};

const applyPipelineByByRepoAndName = async (
    pipelineName,
    repoOwner,
    repoName,
    contextsDict = {},
    k8sEngineCluster = null,
    k8sEngineNamespace = null,
    defaultEngine = false,
) => {
    if (!repoOwner) {
        throw new CFError('repoOwner must be provided');
    }
    if (!repoName) {
        throw new CFError('repoName must be provided');
    }
    if (!pipelineName) {
        throw new CFError('pipelineName must be provided');
    }

    const pipelineToUpdate = {};
    pipelineToUpdate.contexts = _.map(contextsDict, (name, type) => ({
        type,
        name,
    }));

    if (k8sEngineCluster && k8sEngineNamespace) {
        pipelineToUpdate.clusterProvider = {
            active: true,
            selector: k8sEngineCluster,
            namespace: k8sEngineNamespace,
        };
    }

    if (defaultEngine) {
        _.merge(pipelineToUpdate, {
            clusterProvider: {
                active: false,
            },
        });
    }

    return pipeline.patchPipelineByNameAndRepo(pipelineName, repoOwner, repoName, pipelineToUpdate);
};

const runPipelineById = async (
    pipelineId,
    repoBranch = null,
    commitSha = null,
    noCache = false,
    resetVolume = false,
    scale = 1,
    envVarsDict = {},
) => {
    if (!pipelineId) {
        throw new CFError('pipelineId must be provided');
    }

    const options = {
        envVars: envVarsDict,
        noCache,
        resetVolume,
        branch: repoBranch,
        sha: commitSha,
    };

    const promises = [];
    for (let currentExecution = 0; currentExecution < scale; currentExecution += 1) {
        promises.push(pipeline.runPipelineById(pipelineId, options));
    }
    return Promise.all(promises);
};

const runPipelineByRepoAndName = async (
    repoOwner,
    repoName,
    pipelineName,
    repoBranch = null,
    commitSha = null,
    noCache = false,
    resetVolume = false,
    scale = 1,
    envVarsDict = {},
) => {
    if (!repoOwner) {
        throw new CFError('repoOwner must be provided');
    }
    if (!repoName) {
        throw new CFError('repoName must be provided');
    }
    if (!pipelineName) {
        throw new CFError('pipelineName must be provided');
    }
    const options = {
        envVars: envVarsDict,
        noCache,
        resetVolume,
        branch: repoBranch,
        sha: commitSha,
    };

    // run pipeline by name, repo owner and repo name
    if (!repoName || !repoOwner) {
        throw new CFError('repository owner and repository name must be provided');
    }

    const calcedPipeline = await pipeline.getPipelineByNameAndRepo(
        pipelineName,
        repoOwner,
        repoName,
    );
    const pipelineId = _.get(calcedPipeline, 'info.id', null);

    if (pipelineId) {
      const promises = [];
      for (let currentExecution = 0; currentExecution < scale; currentExecution += 1) {
        promises.push(pipeline.runPipelineById(pipelineId, options));
      }
      return Promise.all(promises);
    } else {
      throw new CFError('Could not find pipeline');
    }

};

// eslint-disable-next-line no-unused-vars
const runPipelinesInParallel = async (envFile) => {
    // TODO: Make this work when the appropriate Command works too
    /*
    const jobs = _.map(envFile, ((env) => {
        console.log(env);
        return {
            id: argv.jobs[0].id,
            envs: env
        };
    }));

    let MultipleJobRunner = require('../../../../../logic/api/workflow');
    let runner = new MultipleJobRunner(jobs);
    runner.on('progress', () => {
        let dots = '.';
        return () => {
            dots += '.';
            console.log(dots);
        };
    });
    runner.on('end', (data) => {
        console.log(`all jobs where completed ${JSON.stringify(data)}`);
    });

    return runner.run();
    */
};


module.exports = {
    getPipelineById,
    getPipelineByRepoAndName,
    getPipelinesByRepo,
    getAllPipelines,
    applyPipelineById,
    applyPipelineByByRepoAndName,
    runPipelineById,
    runPipelineByRepoAndName,
    runPipelinesInParallel,
};
