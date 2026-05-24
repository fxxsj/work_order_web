import os
import glob
import re

files_with_errors = [
    "src/views/artwork/ArtworkList.vue",
    "src/views/finance/Cost.vue",
    "src/views/finance/Invoice.vue",
    "src/views/inventory/Quality.vue",
    "src/views/inventory/Stock.vue",
    "src/views/material/MaterialList.vue",
    "src/views/product-group/ProductGroupList.vue",
    "src/views/product/ProductList.vue",
    "src/views/purchase/PurchaseList.vue",
    "src/views/sales/SalesList.vue"
]

for file_path in files_with_errors:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix pagination props
    content = content.replace(':current-page="', ':page="')
    content = content.replace('@update:current-page="', '@update:page="')
    content = content.replace('v-model:current-page="', 'v-model:page="')
    
    # Fix res?.results to (res as any)?.results
    content = content.replace('res?.results', '(res as any)?.results')
    content = content.replace('res?.data', '(res as any)?.data')
    content = content.replace('response?.results', '(response as any)?.results')
    content = content.replace('response?.data', '(response as any)?.data')

    # Fix Stock.vue specific error
    content = content.replace('<Icon name="adjustments" size="sm" />', '<Icon name="edit" size="sm" />')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed!")
