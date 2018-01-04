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

const STATUS_CHOICES = ['error', 'running', 'success', 'terminated'];

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
    filterByTrigger = ['build', 'launch'],
    filterByPipelineNames = [],
    filterByPipelineIds = [],
) => {
    if (_.isEmpty(filterByPipelineIds) && !_.isEmpty(filterByPipelineNames)) {
        const pipelines = await pipeline.getAll({});
        _.forEach(filterByPipelineNames, (pipelineName) => {
            const matchPipelines = _.find(
                pipelines,
                foundPipeline => foundPipeline.info.name.toString() === pipelineName,
            );
            if (_.isArray(matchPipelines)) {
                _.forEach(matchPipelines, (currPipeline) => {
                    filterByPipelineIds.push(currPipeline.info.id);
                });
            } else if (matchPipelines) {
                filterByPipelineIds.push(matchPipelines.info.id);
            } else {
                // matchPipelines is undefined... do nothing.
            }
        });
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
