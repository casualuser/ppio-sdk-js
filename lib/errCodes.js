// const errorCodes = [
//   {
//     code: 307000,
//     Identifier: 'CODE_SUCCEED',
//     msg: 'succeed',
//   },
//   {
//     code: 307001,
//     Identifier: 'CODE_FAIL',
//     msg: 'failed',
//   },
//   {
//     code: 307002,
//     Identifier: 'CODE_OPTION_ILLEGAL',
//     msg: '',
//   },
// ]

module.exports.CODE_SUCCEED = 307000 // Succeed
module.exports.CODE_FAIL = 307001 // Failed
module.exports.CODE_OPTION_ILLEGAL = 307002 // Illegal option
module.exports.CODE_OBJECT_NOT_FOUND = 307003 // Object not Found
module.exports.CODE_TIMEOUT = 307004 //	Timeout
module.exports.CODE_BUCKET_NOT_EXIST = 307101 // Bucket not exist
module.exports.CODE_BUCKET_EXIST = 307102 // Bucket already exist
module.exports.CODE_BUCKET_EXCEED = 307103 //	Bucket count exceed 100
module.exports.CODE_BUCKET_NOT_EMPTY = 307104 // Bucket not empty
module.exports.CODE_OBJECT_KEY_NOT_EXIST = 307151 // Key not exist
module.exports.CODE_OBJECT_KEY_EXIST = 307152 // Key already exist

// module.exports.getErrMsg = errCode => {
//   switch
// }
