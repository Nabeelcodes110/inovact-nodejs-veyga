const { query: Hasura } = require('../../utils/hasura');
const notify = require('../../utils/notify');
const { getUserId, checkValidRequest } = require('./queries/queries');
const { addConnection: addConnectionQuery } = require('./queries/mutations');
const catchAsync = require('../../utils/catchAsync');

const addConnection = catchAsync(async (req, res) => {
  const { user_id } = req.query;

  // Find user id
  const { cognito_sub } = req.query;
  const response1 = await Hasura(getUserId, {
    cognito_sub: { _eq: cognito_sub },
  });

  // If failed to find user return error
  if (!response1.success) return res.json(null, response1.errors);

  // Check if request is possible
  // 1. Check if user exists
  // 2. Check if user is already requested
  const variables = {
    user1: response1.result.data.user[0].id,
    user2: user_id,
  };

  const response2 = await Hasura(checkValidRequest, variables);

  if (!response2.success) return res.json(null, response2.errors);

  // 1. Check if user exists
  if (response2.result.data.user.length === 0)
    return res.json(null, {
      success: false,
      errors: 'InvalidUserId',
      errorMessage: 'The user you are trying to connect to does not exist.',
      data: null,
    });

  // 2. Check if user is already requested
  if (response2.result.data.connections.length)
    return res.json(null, {
      success: false,
      errorCode: 'ConnectionExistsError',
      errorMessage: 'Cannot connect to a person you are already connected with',
      data: null,
    });

  // Add the connection
  const response3 = await Hasura(addConnectionQuery, variables);

  if (!response3.success) res.json(null, response3.errors);

  // Notify the user
  await notify(16, response3.result.data.insert_connections.returning[0].id, response1.result.data.user[0].id, [user_id])
    .then(console.log)
    .catch(console.log);

  res.json(null, {
    success: true,
    errorCode: '',
    errorMessage: '',
    data: null,
  });
});

module.exports = {
  addConnection,
};
