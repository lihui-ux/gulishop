<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >
    <el-table :data="trademarkList" style="width: 100%;margin:20px 0">
      <el-table-column
        type="index"
        label="序号"
        width="80"
        aline="center"
      ></el-table-column>
      <el-table-column prop="tmName" label="品牌名称"></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO">
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" alt style="width:100px;height:50px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row, index }">
          <el-button size="mini" type="warning" @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button size="mini" type="danger" @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="text-align:center"
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      :current-page="page"
      :page-sizes="[3, 5, 7, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
    ></el-pagination>

    <el-dialog
      :title="`${form.id ? '修改' : '添加'}品牌`"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="form" style="width:80%" :rules="rules" ref="form">
        <el-form-item label="品牌名称" :label-width="'100px'" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      dialogFormVisible: false,
      form: {
        tmName: "",
        logoUrl: ""
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change"
          }
        ],
        logoUrl: [
          { required: true, message: "请上传品牌LOGO", trigger: "change" }
        ]
      }
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      } else {
        alert("请求失败");
      }
    },
    handleSizeChange(val) {
      this.limit = val;
      this.getTrademarkList();
    },
    showAddDialog() {
      this.dialogFormVisible = true;
      this.form = {
        tmName: "",
        logoUrl: ""
      };
    },
    save() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let trademark = this.form;
          try {
            const result = await this.$API.trademark.addOrUpdate(trademark);
            if (result.code === 200) {
              this.dialogFormVisible = false;
              this.getTrademarkList();
              this.$message.success(
                `${trademark.id ? "修改" : "添加"}品牌成功`
              );
            } else {
              this.$message.error(`${trademark.id ? "修改" : "添加"}品牌成功`);
            }
          } catch (error) {
            this.$message.error(error.message);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //  上传图片格式修改
    beforeAvatarUpload(file) {
      let fileTypes = ["image/jpeg", "image/jpg", "image/png"];
      const isJPG = fileTypes.indexOf(file.type) !== -1;
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    //上传成功后的处理
    handleAvatarSuccess(res, file) {
      this.form.logoUrl = res.data; //真正的收集上传成功的图片路径
    },
    // 修改
    showUpdateDialog(row) {
      this.dialogFormVisible = true;
      this.form = { ...row };
    },
    //  删除
    deleteTrademark(row) {
      this.$confirm(`确认删除${row.tmName}吗`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const result = await this.$API.trademark.delete(row.id);
          if (result.code === 200) {
            this.$message.success("删除成功");
            this.getTrademarkList(
              this.trademarkList.length > 1 ? this.page : this.page - 1
            );
          } else {
            this.$message.error("删除失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
