import request from '@/utils/request'
export default {
  //  DELETE /admin/product/baseTrademark/remove/{id}--->删除
  delete(id) {
    return request.delete(`/admin/product/baseTrademark/remove/${id}`)
  },
  //  POST /admin/product/baseTrademark/save
  //  PUT /admin/product/baseTrademark/update  ----》添加和修改
  /*  
     添加和修改写在一个函数里，都需要传递一个请求体为参数，请求体参数里有id代表修改
     没有id表示添加
  */
  addOrUpdate(trademark) {
    if (trademark.id) {
      return request.put("/admin/product/baseTrademark/update", trademark)
    } else {
      return request.post("/admin/product/baseTrademark/save", trademark)
    }
  },

  //  GET /admin/product/baseTrademark/{page}/{limit}

  getPageList(page,limit){
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  },
  getList(){
    return request.get('/admin/product/baseTrademark/getTrademarkList')
  }
}
