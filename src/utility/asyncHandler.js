// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).
//             catch((err) => {
//                 next(err)
//             }
//         )
//     }
// }

// export {asyncHandler}


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((error) => {
            console.error(JSON.stringify(error, null, 2));
            next(error)
        } )
    }
}

export {asyncHandler}

