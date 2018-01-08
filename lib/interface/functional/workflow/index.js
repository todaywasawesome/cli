require('debug')('codefresh:functional:functions:workflow');
const _ = require('lodash');
const CFError = require('cf-errors');
const { workflow, pipeline } = require('../../../logic/index').api;
const DEFAULTS = require('../defaults');

//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const STATUS_CHOICES = [
    'error', 'running', 'success', 'terminated', 'pending', 'elected',
];

const TRIGGER_CHOICES = [
    'build', 'launch', 'webhook',
];

const getWorkflow = async (workflowId) => {
    if (!workflowId) {
        throw new CFError('workflowId must be provided');
    }

    return workflow.getWorkflowById(workflowId);
};

const getAllWorkflows = async (
    limit = DEFAULTS.GET_LIMIT_RESULTS,
    page = DEFAULTS.GET_PAGINATED_PAGE,
    filterByStatus = STATUS_CHOICES,
    filterByTrigger = TRIGGER_CHOICES,
    filterByPipelineNames = [],
    filterByPipelineIds = [],
) => {
    if (!_.isEmpty(filterByPipelineNames)) {
        const pipelines = await pipeline.getAll({
            name: filterByPipelineNames,
        });
        if (!_.isEmpty(pipelines)) {
            const MatchPipelines = _.isArray(pipelines) ? pipelines : [pipelines];
            _.forEach(MatchPipelines, (currPipeline) => {
                filterByPipelineIds.push(currPipeline.info.id);
            });
        } else if (_.isEmpty(filterByPipelineIds)) {
            // Cannot find any workflows with these pipelines names
            return [];
        }
    }
    return workflow.getWorkflows({
        limit,
        page,
        status: filterByStatus,
        trigger: filterByTrigger,
        pipelineIds: filterByPipelineIds,
    });
};

module.exports = {
    getWorkflow,
    getAllWorkflows,
};
