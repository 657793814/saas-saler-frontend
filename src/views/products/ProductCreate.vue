<template>
  <div class="product-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新增商品</span>
        </div>
      </template>

      <el-form
          :model="productForm"
          :rules="productRules"
          ref="productFormRef"
          label-width="120px"
          v-loading="loading">

        <!-- 基本信息 -->
        <el-card shadow="never" class="form-section">
          <template #header>
            <div class="section-header">基本信息</div>
          </template>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品标题" prop="title">
                <el-input
                    v-model="productForm.title"
                    placeholder="请输入商品标题"/>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="商品简介" prop="summary">
                <el-input
                    v-model="productForm.summary"
                    placeholder="请输入商品简介"/>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="详细描述" prop="description">
                <el-input
                    v-model="productForm.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入商品详细描述"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 商品图片 -->
        <el-card shadow="never" class="form-section">
          <template #header>
            <div class="section-header">商品图片</div>
          </template>

          <el-form-item label="商品图集">
            <el-upload
                list-type="picture-card"
                :file-list="productForm.images"
                :on-preview="handlePicturePreview"
                :on-remove="handlePictureRemove"
                :on-success="handlePictureSuccess"
                :on-error="handlePictureError"
                :before-upload="beforePictureUpload"
                :http-request="customPictureUpload"
                multiple>
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
        </el-card>

        <!-- 规格类型管理 -->
        <el-card shadow="never" class="form-section">
          <template #header>
            <div class="section-header">规格类型管理</div>
          </template>

          <!-- 添加新规格类型 -->
          <el-row :gutter="10" style="margin-bottom: 15px;">
            <el-col :span="18">
              <el-input
                  v-model="newSpecTypeName"
                  placeholder="请输入新的规格类型名称"
                  @keyup.enter="addNewSpecType"
              />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="addNewSpecType" style="width: 100%;">添加规格类型</el-button>
            </el-col>
          </el-row>

          <!-- 从已有规格中选择 -->
          <el-button @click="openSpecTypeDialog" type="success" size="small" style="margin-bottom: 15px;">
            从已有规格中选择
          </el-button>

          <!-- 已有规格类型展示 -->
          <div>
            <el-tag
                v-for="spec in specifications"
                :key="spec.id"
                closable
                @close="removeSpecType(spec.id)"
                :type="selectedSpecs.includes(spec.id) ? 'primary' : ''"
                class="spec-type-tag">
              {{ spec.name }}
            </el-tag>
          </div>
        </el-card>

        <!-- 规格设置 -->
        <el-card shadow="never" class="form-section">
          <template #header>
            <div class="section-header">规格设置</div>
          </template>

          <el-form-item label="规格类型">
            <el-checkbox-group v-model="selectedSpecs">
              <el-checkbox
                  v-for="spec in specifications"
                  :key="spec.id"
                  :label="spec.id">
                {{ spec.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 规格值设置 -->
          <div v-for="specId in selectedSpecs" :key="specId" class="spec-section">
            <el-divider>{{ getSpecName(specId) }}</el-divider>
            <el-form-item>
              <el-tag
                  v-for="value in getSpecValues(specId)"
                  :key="value.id"
                  class="spec-tag">
                {{ value.value }}
              </el-tag>
              <el-input
                  v-model="newSpecValues[specId]"
                  placeholder="请输入规格值，按回车添加"
                  @keyup.enter="addSpecValue(specId)"
                  style="width: 200px; margin-top: 10px;"
                  size="small"/>
            </el-form-item>
          </div>
        </el-card>

        <!-- SKU列表 -->
        <el-card shadow="never" class="form-section" v-if="skuList.length > 0">
          <template #header>
            <div class="section-header">SKU列表</div>
          </template>

          <el-table :data="skuList" border>
            <el-table-column label="规格组合" width="300">
              <template #default="scope">
                <span>{{ formatSpecCombination(scope.row.specifications) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="销售价" width="120">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.price"
                    :precision="2"
                    :step="0.1"
                    size="small"/>
              </template>
            </el-table-column>
            <el-table-column prop="costPrice" label="成本价" width="120">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.costPrice"
                    :precision="2"
                    :step="0.1"
                    size="small"/>
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="120">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.stock"
                    :min="0"
                    size="small"/>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 提交按钮 -->
        <div class="form-footer">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">提交</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="图片预览">
      <img :src="previewImageUrl" style="width: 100%"/>
    </el-dialog>

    <!-- 选择已有规格类型弹窗 -->
    <el-dialog
        v-model="specTypeDialogVisible"
        title="选择已有规格类型"
        width="600px">
      <el-table
          :data="availableSpecTypes"
          @selection-change="handleSpecTypeSelection"
          max-height="400">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="specTypeName" label="规格类型名称"></el-table-column>
        <el-table-column label="规格值">
          <template #default="scope">
            <span v-if="scope.row.specValues && scope.row.specValues.length > 0">
              {{ scope.row.specValues.map(v => v.specValue).join(', ') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div style="text-align: right;">
          <el-button @click="specTypeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSpecTypeSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script>
import {computed, onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import CryptoJS from 'crypto-js';
import productService from "@/utils/productService";

export default {
  name: 'ProductCreate',
  setup() {
    const productFormRef = ref(null)
    const loading = ref(false)
    const submitLoading = ref(false)
    const previewVisible = ref(false)
    const previewImageUrl = ref('')

    // 规格类型管理相关
    const newSpecTypeName = ref('')
    const specTypeDialogVisible = ref(false)
    const availableSpecTypes = ref([]) // 从API获取的可用规格类型
    const selectedSpecTypeRows = ref([]) // 表格中选择的规格类型

    // 商品表单数据
    const productForm = reactive({
      title: '',
      summary: '',
      description: '',
      images: []
    })

    // 规格相关
    const specifications = ref([
      {id: 1, name: '颜色', values: []},
      {id: 2, name: '尺寸', values: []},
      {id: 3, name: '材质', values: []}
    ])

    const selectedSpecs = ref([])
    const newSpecValues = reactive({})

    // 表单验证规则
    const productRules = {
      title: [
        {required: true, message: '请输入商品标题', trigger: 'blur'}
      ],
      summary: [
        {required: true, message: '请输入商品简介', trigger: 'blur'}
      ],
      description: [
        {required: true, message: '请输入商品详细描述', trigger: 'blur'}
      ]
    }

    // 计算SKU列表
    const skuList = computed(() => {
      if (selectedSpecs.value.length === 0) return []

      // 获取选中规格的值组合
      const specValues = selectedSpecs.value.map(specId => {
        const spec = specifications.value.find(s => s.id === specId)
        return spec.values.map(value => ({
          specId,
          specName: spec.name,
          valueId: value.id,
          value: value.value
        }))
      })

      // 生成笛卡尔积
      const combinations = cartesianProduct(specValues)

      // 转换为SKU格式
      return combinations.map((combination, index) => ({
        id: index + 1,
        specifications: combination,
        price: 0,
        costPrice: 0,
        stock: 0
      }))
    })

    // 笛卡尔积计算函数
    const cartesianProduct = (arrays) => {
      if (arrays.length === 0) return []
      if (arrays.length === 1) return arrays[0].map(item => [item])

      const result = []
      const restProducts = cartesianProduct(arrays.slice(1))

      for (const item of arrays[0]) {
        for (const restProduct of restProducts) {
          result.push([item, ...restProduct])
        }
      }

      return result
    }

    // 获取规格名称
    const getSpecName = (specId) => {
      const spec = specifications.value.find(s => s.id === specId)
      return spec ? spec.name : ''
    }

    // 获取规格值
    const getSpecValues = (specId) => {
      const spec = specifications.value.find(s => s.id === specId)
      return spec ? spec.values : []
    }

    // 添加新规格类型
    const addNewSpecType = () => {
      if (!newSpecTypeName.value.trim()) {
        ElMessage.warning('请输入规格类型名称')
        return
      }

      // 检查是否已存在同名规格类型
      const exists = specifications.value.some(spec => spec.name === newSpecTypeName.value.trim())
      if (exists) {
        ElMessage.warning('该规格类型已存在')
        return
      }

      // 添加新规格类型（使用临时ID，不在新增时候创建了，提价商品时统一创建）
      const newSpec = {
        id: "tmp_" + Date.now(), // 临时ID
        name: newSpecTypeName.value.trim(),
        values: []
      }

      specifications.value.push(newSpec)
      newSpecTypeName.value = ''
      ElMessage.success('规格类型添加成功')
    }

    // 移除规格类型
    const removeSpecType = (specId) => {
      // 从规格类型列表中移除
      specifications.value = specifications.value.filter(s => s.id !== specId)
      // 从选中列表中移除
      selectedSpecs.value = selectedSpecs.value.filter(id => id !== specId)
      // 清除对应的新规格值输入框
      delete newSpecValues[specId]
    }

    // 打开规格类型选择弹窗
    const openSpecTypeDialog = async () => {
      // 加载已有规格类型数据（模拟API调用）
      await loadAvailableSpecTypes()
      specTypeDialogVisible.value = true
      // 清空之前的选择
      selectedSpecTypeRows.value = []
    }

    // 加载可用的规格类型（模拟API调用）
    const loadAvailableSpecTypes = async () => {
      loading.value = true
      try {
        // 这里应该调用真实的API获取规格类型数据
        // 示例数据结构:
        availableSpecTypes.value = [
          {
            specTypeId: 10,
            specTypeName: '品牌',
            specValues: [
              {specId: 101, specValue: '耐克'},
              {specId: 102, specValue: '阿迪达斯'},
              {specId: 103, specValue: '新百伦'}
            ]
          },
          {
            specTypeId: 11,
            specTypeName: '重量',
            specValues: [
              {specId: 111, specValue: '100g'},
              {specId: 112, specValue: '200g'},
              {specId: 113, specValue: '500g'}
            ]
          }
        ]
      } catch (error) {
        ElMessage.error('加载规格类型失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    // 处理规格类型选择
    const handleSpecTypeSelection = (selection) => {
      selectedSpecTypeRows.value = selection
    }

    // 确认规格类型选择
    const confirmSpecTypeSelection = () => {
      if (selectedSpecTypeRows.value.length === 0) {
        ElMessage.warning('请至少选择一个规格类型')
        return
      }

      selectedSpecTypeRows.value.forEach(specType => {
        // 检查是否已存在该规格类型
        const exists = specifications.value.some(s => s.id === specType.specTypeId)
        if (!exists) {
          // 添加规格类型
          const newSpec = {
            id: specType.specTypeId,
            name: specType.specTypeName,
            values: []
          }

          // 添加规格值（如果有的话）
          if (specType.specValues && specType.specValues.length > 0) {
            newSpec.values = specType.specValues.map(value => ({
              id: value.specId,
              value: value.specValue
            }))
          }

          specifications.value.push(newSpec)
          ElMessage.success(`"${specType.specTypeName}" 规格类型添加成功`)
        } else {
          ElMessage.info(`"${specType.specTypeName}" 规格类型已存在`)
        }
      })

      // 关闭弹窗
      specTypeDialogVisible.value = false
    }

    // 添加规格值
    const addSpecValue = (specId) => {
      const value = newSpecValues[specId]
      if (!value) return

      const spec = specifications.value.find(s => s.id === specId)
      if (spec) {
        // 检查是否已存在
        const exists = spec.values.some(v => v.value === value)
        if (!exists) {
          spec.values.push({
            id: "tmp_" + Date.now(), // 简单生成唯一ID
            value: value
          })
        }
        newSpecValues[specId] = ''
      }
    }

    // 删除规格值（根据需求不支持删除，但保留原有功能）
    const removeSpecValue = (specId, valueId) => {
      // 根据新需求，不支持删除规格值
      ElMessage.info('根据需求不支持删除规格值id:', specId)
      ElMessage.info('根据需求不支持删除规格值value:', valueId)
      // 如果需要实现删除功能，可以取消下面的注释
      /*
      const spec = specifications.value.find(s => s.id === specId)
      if (spec) {
        spec.values = spec.values.filter(v => v.id !== valueId)
      }
      */
    }

    // 图片上传前的处理
    const beforePictureUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }

    // 图片上传相关方法
    const handlePicturePreview = (file) => {
      previewImageUrl.value = file.url || URL.createObjectURL(file.raw)
      previewVisible.value = true
    }

    const handlePictureRemove = (file, fileList) => {
      productForm.images = fileList
    }

    // 自定义上传方法 - 适配当前的 apiRequest
    const customPictureUpload = async (options) => {
      const {file, onSuccess, onError} = options;

      try {
        // 使用 FormData 构造请求数据
        const formData = new FormData();
        formData.append('file', file);

        // 获取认证信息
        const token = localStorage.getItem('token');
        const rand_str = localStorage.getItem('rand_str');
        const tenant_code = localStorage.getItem('tenant_code');

        if (!token || !rand_str) {
          throw new Error('缺少认证信息');
        }

        // 生成签名参数
        const timestamp = Math.floor(Date.now() / 1000);
        const sign = CryptoJS.MD5(rand_str + timestamp + token).toString();

        // 添加认证参数到 FormData
        formData.append('token', token);
        formData.append('rand_str', rand_str);
        formData.append('sign', sign);
        formData.append('timestamp', timestamp);

        // 使用 fetch 直接发送请求，绕过 apiRequest 的 JSON 处理
        const response = await fetch('/api/minio/upload', {
          method: 'POST',
          body: formData,
          headers: {
            // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 及 boundary
            'header_tenant_code': tenant_code || ''
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          // 调用 onSuccess 回调，传递响应数据
          if (onSuccess) {
            onSuccess(result, file);
          }
        } else {
          // 调用 onError 回调
          if (onError) {
            onError(new Error(result.msg || '上传失败'));
          }
        }
      } catch (error) {
        // 调用 onError 回调，传递错误信息
        if (onError) {
          onError(error);
        }
        console.error('图片上传失败:', error);
      }
    };

    const handlePictureSuccess = (response, file, fileList) => {
      // 从响应中获取文件URL并更新文件列表
      if (response && response.data) {
        // 假设响应结构为 { code: 0, data: { url: '图片URL' } }
        file.url = response.data.url || response.data;
        file.response = response; // 保存响应数据
      } else if (response && response.url) {
        // 如果响应直接包含 url 字段
        file.url = response.url;
        file.response = response;
      }
      productForm.images = fileList;
      ElMessage.success('图片上传成功');
    }

    const handlePictureError = (err, file, fileList) => {
      ElMessage.error('图片上传失败: ' + (err.message || '未知错误'));
      console.error('图片上传错误:', err);
      productForm.images = fileList; // 更新文件列表状态
    }

    // 格式化规格组合显示
    const formatSpecCombination = (specs) => {
      return specs.map(spec => `${spec.specName}:${spec.value}`).join(' ');
    }

    // 重置表单
    const resetForm = () => {
      productFormRef.value.resetFields();
      productForm.images = [];
      selectedSpecs.value = [];
      specifications.value.forEach(spec => {
        spec.values = [];
      });
    }

    // 提交表单
    const submitForm = async () => {
      if (!productFormRef.value) return;

      await productFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            // 准备提交数据（改为JSON格式）
            const submitData = {
              title: productForm.title,
              summary: productForm.summary,
              description: productForm.description,
              imageUrls: [],
              skus: []
            };

            // 添加图片文件URL（已上传的图片）
            productForm.images.forEach((file) => {
              if (file.url) {
                submitData.imageUrls.push(file.url);
              }
            });

            // 添加SKU数据
            skuList.value.forEach((sku) => {
              submitData.skus.push({
                price: sku.price,
                costPrice: sku.costPrice,
                stock: sku.stock,
                specifications: sku.specifications.map(spec => ({
                  specId: spec.specId,
                  specName: spec.specName,
                  valueId: spec.valueId,
                  value: spec.value
                }))
              });
            });

            const result = await productService.createProduct(submitData);
            
            if (result.code === 0) {
              ElMessage.success('商品创建成功');
              resetForm();
            } else {
              ElMessage.error(result.msg || '商品创建失败');
            }
          } catch (error) {
            ElMessage.error('商品创建失败: ' + (error.response?.data?.msg || error.message));
          } finally {
            submitLoading.value = false;
          }
        }
      });
    }

    onMounted(() => {
      // 初始化新规格值对象
      specifications.value.forEach(spec => {
        newSpecValues[spec.id] = '';
      });
    })

    return {
      productFormRef,
      loading,
      submitLoading,
      previewVisible,
      previewImageUrl,
      productForm,
      productRules,
      specifications,
      selectedSpecs,
      newSpecValues,
      skuList,
      getSpecName,
      getSpecValues,
      addSpecValue,
      removeSpecValue,
      beforePictureUpload,
      customPictureUpload,
      handlePicturePreview,
      handlePictureRemove,
      handlePictureSuccess,
      handlePictureError,
      formatSpecCombination,
      resetForm,
      submitForm,
      // 新增的规格类型管理相关
      newSpecTypeName,
      addNewSpecType,
      removeSpecType,
      specTypeDialogVisible,
      availableSpecTypes,
      selectedSpecTypeRows,
      openSpecTypeDialog,
      handleSpecTypeSelection,
      confirmSpecTypeSelection
    }
  }
}
</script>


<style scoped>
.product-create {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.section-header {
  font-weight: bold;
  color: #333;
}

.spec-section {
  margin-bottom: 20px;
}

.spec-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.form-footer {
  text-align: center;
  padding: 20px 0;
}

.spec-type-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
