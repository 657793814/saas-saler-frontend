<template>
  <div class="product-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEditMode.value ? '编辑商品' : '新增商品' }}</span>
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
                <div class="quill-editor-container">
                  <QuillEditor
                      v-model:content="productForm.description"
                      contentType="html"
                      class="quill-editor-wrapper"
                  />
                </div>
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
                <el-tag
                    v-if="typeof scope.row.id === 'string' && scope.row.id.startsWith('new_')"
                    type="warning"
                    size="mini"
                    style="margin-left: 10px;">
                  新增
                </el-tag>
                <el-tag
                    v-else-if="scope.row.skuId && scope.row.skuId > 0"
                    type="success"
                    size="mini"
                    style="margin-left: 10px;">
                  已存在
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="price" label="销售价" width="150">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.price"
                    :precision="2"
                    :step="0.1"
                    size="small"/>
              </template>
            </el-table-column>
            <el-table-column prop="costPrice" label="成本价" width="150">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.costPrice"
                    :precision="2"
                    :step="0.1"
                    size="small"/>
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="150">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.stock"
                    :min="0"
                    size="small"/>
              </template>
            </el-table-column>
            <!-- SKU图片上传列 -->
            <el-table-column label="预览图" width="150">
              <template #default="scope">
                <div class="sku-image-container">
                  <!-- 如果已有图片，显示图片和删除按钮 -->
                  <div v-if="scope.row.image" class="sku-image-wrapper">
                    <div class="sku-image-preview">
                      <img
                          :src="scope.row.image"
                          class="sku-preview-img"
                          @click="handleSkuImagePreviewByImageUrl(scope.row.image)"
                      />
                      <el-button
                          class="sku-image-delete-btn"
                          type="danger"
                          size="small"
                          @click="handleSkuImageRemove(scope.row)"
                          icon="el-icon-delete"
                          circle
                      ></el-button>
                    </div>
                  </div>
                  <!-- 如果没有图片，显示上传组件 -->
                  <el-upload
                      v-else
                      class="sku-image-uploader"
                      list-type="picture-card"
                      :file-list="[]"
                      :on-preview="(file) => handleSkuImagePreview(file)"
                      :on-success="(response, file) => handleSkuImageSuccess(response, file, scope.row)"
                      :on-error="handleSkuImageError"
                      :before-upload="beforePictureUpload"
                      :http-request="(options) => customPictureUpload(options)"
                      :limit="1">
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </div>
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
        width="700px">
      <!-- 查询条件 -->
      <div style="margin-bottom: 15px;">
        <el-input
            v-model="specTypeQuery.name"
            placeholder="请输入规格类型名称"
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="searchSpecTypes"
        />
        <el-button type="primary" @click="searchSpecTypes">查询</el-button>
      </div>

      <!-- 规格类型表格 -->
      <el-table
          :data="availableSpecTypes"
          @selection-change="handleSpecTypeSelection"
          v-loading="loading"
          height="400"
          :key="specTypeDialogVisible.toString()"
          style="width: 100%">
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

      <!-- 分页 -->
      <el-pagination
          v-if="specTypeQuery.total > 0"
          layout="total, sizes, prev, pager, next, jumper"
          :total="specTypeQuery.total"
          :page-sizes="[10, 20, 50, 100]"
          v-model:page-size="specTypeQuery.pageSize"
          v-model:current-page="specTypeQuery.pageNum"
          @size-change="handleSpecTypePageSizeChange"
          @current-change="handleSpecTypePageChange"
          style="margin-top: 15px; text-align: right;"
      />

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
import {computed, nextTick, onMounted, reactive, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import CryptoJS from 'crypto-js';
import productService from "@/utils/productService";
import {debounce} from 'lodash';
import {QuillEditor} from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import apiRequest from "@/utils/request";
import {useRoute} from "vue-router";

export default {
  name: 'ProductCreate',
  components: {
    QuillEditor
  },
  setup() {

    //编辑
    const isEditMode = ref(false);
    const route = useRoute()

    // 获取商品详情
    const fetchProductDetail = async (productId) => {

      if (productId == 0 || productId == undefined) {
        return;
      }

      try {
        const params = {
          productId: productId,
        };

        const result = await productService.getProductDetail(params);
        if (result.code === 0) {
          console.log('获取商品详情成功:', result.data)
          await editProductInit(result.data);
        } else {
          ElMessage.error(result.msg || '获取商品详情失败');
        }
      } catch (error) {
        ElMessage.error('获取商品详情出错: ' + error.message);
      } finally {
        isEditMode.value = true;
      }
    }

    // 监听路由变化
    watch(
        () => route.query.productId,
        (newProductId, oldProductId) => {
          if (newProductId) {
            console.log('Product ID changed from:', oldProductId)
            console.log('Product ID changed to:', newProductId)
            // 处理 productId 变化
            fetchProductDetail(newProductId)
          }
        },
        {immediate: true} // 立即执行一次
    )

    //编辑商品页面初始化
    const editProductInit = async (productData) => {
      productForm.title = productData.title || '';
      productForm.summary = productData.summary || '';
      productForm.description = productData.description || '';

      // 填充商品图片
      if (productData.imageUrls && productData.imageUrls.length > 0) {
        // imgObj ：{url:"",path:""}
        productForm.images = productData.imageUrls.map((imgObj, index) => ({
          url: imgObj.url,
          path: imgObj.path,
          name: `image_${index}`,
          uid: index
        }));
      }

      // 填充SKU信息到规格系统
      if (productData.skus && productData.skus.length > 0) {
        // 提取所有规格类型和规格值
        const specMap = new Map(); // 用于存储规格类型信息

        // 处理SKU数据并提取规格信息
        const processedSkus = productData.skus.map((sku, index) => {

          console.log("sku index;" + index + " sku:", sku);

          // 处理规格信息
          sku.specifications.forEach(spec => {
            // 如果规格类型不存在，则添加
            if (!specMap.has(spec.specId)) {
              specMap.set(spec.specId, {
                id: spec.specId,
                name: spec.specName,
                values: []
              });
            }

            // 获取当前规格类型
            const specInfo = specMap.get(spec.specId);

            // 检查规格值是否已存在
            const valueExists = specInfo.values.some(v => v.id === spec.valueId);
            if (!valueExists) {
              specInfo.values.push({
                id: spec.valueId,
                value: spec.value
              });
            }
          });

          // 返回处理后的SKU对象
          const imageObj = sku.imageObj;
          return {
            id: index + 1,
            skuId: sku.skuId,  //编辑时有值
            specifications: sku.specifications,
            price: sku.price || 0,
            costPrice: sku.costPrice || 0,
            stock: sku.stock || 0,
            image: imageObj.url || '', // 完整图片URL
            imgPath: imageObj.path || '' // 图片路径
          };
        });

        // 将规格信息填充到页面
        specifications.value = Array.from(specMap.values());
        selectedSpecs.value = Array.from(specMap.keys());

        // 初始化新规格值对象
        specifications.value.forEach(spec => {
          newSpecValues[spec.id] = '';
        });

        // 保存处理后的SKU数据
        productForm.skus = processedSkus;

      }
    }

    /** 以下商品创建逻辑  **/

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

    // 规格类型查询相关
    const specTypeQuery = reactive({
      name: '',
      pageNum: 1,
      pageSize: 10,
      total: 0
    })

    // 商品表单数据
    const productForm = reactive({
      title: '',
      summary: '',
      description: '',
      images: [],
      skus: []
    })

    // 规格相关
    const specifications = ref([]); //标记所有规格类型
    const selectedSpecs = ref([]);  //标记选中的规格类型ID集合
    const newSpecValues = reactive({}); //标记规格类型下面的新增规格值

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
      // 如果没有选择任何规格，返回空数组
      if (selectedSpecs.value.length === 0) return [];

      // 获取当前选中的规格值组合
      const currentSpecValues = selectedSpecs.value.map(specId => {
        const spec = specifications.value.find(s => s.id === specId);
        return spec ? spec.values.map(value => ({
          specId,
          specName: spec.name,
          valueId: value.id,
          value: value.value
        })) : [];
      });

      // 如果是编辑模式且已有SKU数据
      if (isEditMode.value && productForm.skus && productForm.skus.length > 0) {
        // 生成当前规格的笛卡尔积
        const currentCombinations = cartesianProduct(currentSpecValues);

        // 创建一个映射来存储已有的SKU数据，便于快速查找
        const existingSkuMap = new Map();

        // 为每个已有的SKU创建一个唯一的规格组合键
        productForm.skus.forEach(sku => {
          if (sku.specifications && sku.specifications.length > 0) {
            const specKey = sku.specifications
                .map(spec => `${spec.specId}-${spec.valueId}`)
                .sort()
                .join('|');
            existingSkuMap.set(specKey, sku);
          }
        });

        // 合并已有的SKU和新生成的SKU组合
        const mergedSkus = currentCombinations.map((combination, index) => {
          // 为当前组合创建唯一键
          const combinationKey = combination
              .map(spec => `${spec.specId}-${spec.valueId}`)
              .sort()
              .join('|');

          // 检查是否已存在对应的SKU
          if (existingSkuMap.has(combinationKey)) {
            // 使用已有的SKU数据
            return existingSkuMap.get(combinationKey);
          } else {
            // 创建新的SKU条目
            return {
              id: `new_${Date.now()}_${index}`, // 为新增的SKU创建唯一标识
              skuId: 0,  //新增时为0
              specifications: combination,
              price: 0,
              costPrice: 0,
              stock: 0,
              image: '',
              imgPath: ''
            };
          }
        });

        return mergedSkus;
      }

      // 新增模式 或 没有SKU数据的情况
      // 生成笛卡尔积
      const combinations = cartesianProduct(currentSpecValues);

      // 转换为SKU格式
      return combinations.map((combination, index) => ({
        id: index + 1,
        skuId: 0,
        specifications: combination,
        price: 0,
        costPrice: 0,
        stock: 0,
        image: '',
        imgPath: ''
      }));
    });


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
      const trimmedName = newSpecTypeName.value ? newSpecTypeName.value.trim() : '';
      if (!trimmedName) {
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
        id: "tmp_type_" + Date.now(), // 临时ID
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
      specTypeDialogVisible.value = true
      // 清空之前的选择
      selectedSpecTypeRows.value = []

      // 使用 nextTick 确保 DOM 更新完成后再加载数据
      await nextTick();
      await loadAvailableSpecTypes();
    }

    // 加载可用的规格类型（模拟API调用）
    const loadAvailableSpecTypes = async () => {
      loading.value = true
      try {
        // 构造查询参数
        const submitData = {
          current: specTypeQuery.pageNum,
          size: specTypeQuery.pageSize
        };

        // 只有当规格类型名称存在且不为空时才添加到查询条件中
        if (specTypeQuery.name && specTypeQuery.name.trim() !== '') {
          submitData.name = specTypeQuery.name.trim();
        }
        const result = await productService.specDataPage(submitData);
        if (result.code === 0) {
          availableSpecTypes.value = result.data.records;
          specTypeQuery.total = result.data.total;
        } else {
          ElMessage.error(result.msg || '加载规格类型失败');
        }
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
            id: "tmp_value_" + Date.now(), // 简单生成唯一ID
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
        formData.append('objectName', "/product_img/" + apiRequest.getTodayDateString() + "/" + apiRequest.generateRandomString(8));

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
        file.path = response.data.path;
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
                //提交只传路径即可
                submitData.imageUrls.push(file.path);
              }
            });

            // 添加SKU数据 - 只提交有规格的SKU
            skuList.value.forEach((sku) => {
              // 只处理有规格的SKU
              if (sku.specifications && sku.specifications.length > 0) {
                const skuData = {
                  price: sku.price || 0,
                  costPrice: sku.costPrice || 0,
                  stock: sku.stock || 0,
                  image: sku.imgPath || '', // 添加图片路径
                  specifications: sku.specifications.map(spec => ({
                    specId: spec.specId,
                    specName: spec.specName,
                    valueId: spec.valueId,
                    value: spec.value
                  }))
                };

                // 如果是已存在的SKU且有有效的skuId，添加skuId信息
                if (sku.skuId && sku.skuId > 0) {
                  skuData.skuId = sku.skuId;
                }

                // 如果是已存在的SKU且有有效的id且不是新增标识，添加id
                if (typeof sku.id === 'number') {
                  skuData.id = sku.id;
                }

                submitData.skus.push(skuData);
              }
            });

            let result;
            if (isEditMode.value && route.query.productId) {
              submitData.id = route.query.productId;
              result = await productService.editProduct(submitData);
            } else {
              result = await productService.createProduct(submitData);
            }

            if (result.code === 0) {
              ElMessage.success(isEditMode.value ? '商品更新成功' : '商品创建成功');
              // 如果是编辑模式，重新加载数据以刷新页面
              if (isEditMode.value && route.query.productId) {
                // 重新获取商品详情数据
                await fetchProductDetail(route.query.productId);
              } else {
                // 新增模式下重置表单
                resetForm();
              }
            } else {
              ElMessage.error(result.msg || (isEditMode.value ? '商品更新失败' : '商品创建失败'));
            }
          } catch (error) {
            ElMessage.error((isEditMode.value ? '商品更新失败' : '商品创建失败') + ': ' + (error.response?.data?.msg || error.message));
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

    // SKU图片预览相关方法
    const handleSkuImagePreview = (file) => {
      // 处理上传组件传递的文件对象
      previewImageUrl.value = file.url || file.response?.data?.url || file.response?.url || (file.raw ? URL.createObjectURL(file.raw) : '');
      previewVisible.value = true;
    }

    // 专门处理直接图片URL的预览方法
    const handleSkuImagePreviewByImageUrl = (imageUrl) => {
      previewImageUrl.value = imageUrl;
      previewVisible.value = true;
    }

    const handleSkuImageRemove = (skuRow) => {
      skuRow.image = ''
    }

    const handleSkuImageSuccess = (response, file, skuRow) => {
      if (response && response.data) {
        skuRow.image = response.data.url || response.data
        skuRow.imgPath = response.data.path; //只上传路径即可
      } else if (response && response.url) {
        skuRow.image = response.url
      }
      ElMessage.success('SKU图片上传成功')
    }

    const handleSkuImageError = (err) => {
      ElMessage.error('SKU图片上传失败: ' + (err.message || '未知错误'))
      console.error('SKU图片上传错误:', err)
    }

    // 防抖处理规格类型加载
    const debouncedLoadAvailableSpecTypes = debounce(loadAvailableSpecTypes, 300);

    // 查询规格类型
    const searchSpecTypes = () => {
      specTypeQuery.pageNum = 1; // 重置到第一页
      // 清理输入内容（去除首尾空格）
      if (specTypeQuery.name) {
        specTypeQuery.name = specTypeQuery.name.trim();
      }
      debouncedLoadAvailableSpecTypes();
    }

    // 分页变化处理
    const handleSpecTypePageChange = (pageNum) => {
      specTypeQuery.pageNum = pageNum;
      debouncedLoadAvailableSpecTypes();
    }

    // 每页数量变化处理
    const handleSpecTypePageSizeChange = (pageSize) => {
      specTypeQuery.pageNum = 1; // 重置到第一页
      specTypeQuery.pageSize = pageSize;
      debouncedLoadAvailableSpecTypes();
    }

    // 重置表单
    const resetForm = () => {
      productFormRef.value.resetFields();
      productForm.images = [];
      selectedSpecs.value = [];
      specifications.value.forEach(spec => {
        spec.values = [];
      });
      productForm.description = '';
    }

    return {
      //编辑商品
      isEditMode,
      fetchProductDetail,
      editProductInit,

      //创建商品
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
      handleSkuImagePreview,
      handleSkuImagePreviewByImageUrl,
      handleSkuImageRemove,
      handleSkuImageSuccess,
      handleSkuImageError,
      formatSpecCombination,
      resetForm,
      submitForm,

      // 规格类型管理相关
      searchSpecTypes,
      handleSpecTypePageChange,
      handleSpecTypePageSizeChange,
      newSpecTypeName,
      addNewSpecType,
      removeSpecType,
      specTypeDialogVisible,
      availableSpecTypes,
      selectedSpecTypeRows,
      specTypeQuery,
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

/* SKU图片相关样式 */
.sku-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sku-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sku-image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.sku-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.sku-preview-img:hover {
  transform: scale(1.05);
}

.sku-image-delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  min-width: 20px;
  padding: 0;
  border: 1px solid #fff;
}

/* 上传组件样式 */
.sku-image-uploader .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
  border-radius: 6px;
}

.sku-image-uploader .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}

/* Quill Editor 样式修复 */
.quill-editor-container {
  height: 300px;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.quill-editor-wrapper {
  height: 100%;
}

.quill-editor-wrapper :deep(.ql-toolbar) {
  border: none !important;
  border-bottom: 1px solid #dcdfe6 !important;
  border-radius: 4px 4px 0 0 !important;
  background-color: #f5f7fa !important;
  height: auto !important;
  display: block !important;
}

.quill-editor-wrapper :deep(.ql-container) {
  height: calc(100% - 42px) !important;
  border: none !important;
  border-radius: 0 0 4px 4px !important;
  display: block !important;
}

.quill-editor-wrapper :deep(.ql-editor) {
  height: calc(100% - 20px) !important;
  overflow-y: auto !important;
}

.quill-editor-wrapper :deep(.ql-editor.ql-blank::before) {
  font-style: normal !important;
  color: #ccc !important;
}
</style>