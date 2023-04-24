export const getTimestamp = () =>{
    return new Date(new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000')
}