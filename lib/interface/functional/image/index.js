require('debug')('codefresh:functional:functions:image');
const CFError = require('cf-errors');
const { image } = require('../../../logic/index').api;
const DEFAULTS = require('../defaults');
const { parseFamiliarName } = require('@codefresh-io/docker-reference');

//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const getImage = async (imageId) => {
    if (!imageId) {
        throw new CFError('imageId must be provided');
    }

    const result = await image.getImageById(imageId);

    // TODO: For some reason, this returns an array..
    if (result && result.length > 0) {
        return result[0];
    }

    return result;
};

const getAllImages = async (
    filterBySHA = null,
    filterByLabelsDict = {},
    resultsLimit = DEFAULTS.GET_LIMIT_RESULTS,
    filterRegistries = DEFAULTS.CODEFRESH_REGISTRIES,
) => image.getAll({
    labels: filterByLabelsDict,
    sha: filterBySHA,
    limit: resultsLimit,
    filterRegistries,
});

const annotateImage = async (imageId, labelsDict = {}) => {
    if (!imageId) {
        throw new CFError('imageId must be provided');
    }

    let dockerImageId = imageId;
    const useFullName = dockerImageId.includes(':');
    const annotations = labelsDict;

    if (useFullName) {
        const { repository, tag } = parseFamiliarName(dockerImageId);
        dockerImageId = await image.getDockerImageId(repository, tag);
    }

    return image.annotateImage(dockerImageId, annotations);
};

module.exports = {
    getImage,
    getAllImages,
    annotateImage,
};
