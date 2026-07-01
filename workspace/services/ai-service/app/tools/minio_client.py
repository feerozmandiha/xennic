"""
MinIO Client for Xennic AI Platform

Handles file upload/download from MinIO object storage
Supports workspace isolation (files are stored in workspace-specific buckets)
"""

import os
import tempfile
from typing import Optional, BinaryIO
from pathlib import Path

try:
    from minio import Minio
    from minio.error import S3Error
    HAS_MINIO = True
except ImportError:
    HAS_MINIO = False
    print("⚠️ MinIO client not installed. MinIO integration disabled.")

from ..config.settings import settings


class MinIOClient:
    """
    MinIO Client for file operations
    
    Bucket structure: {workspace_id}-documents
    Each workspace has its own bucket for isolation
    """
    
    def __init__(self):
        self.endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
<<<<<<< HEAD
        self.access_key = os.getenv('MINIO_ACCESS_KEY', 'MINIO_CREDENTIALS_FROM_ENV')
        self.secret_key = os.getenv('MINIO_SECRET_KEY', 'MINIO_CREDENTIALS_FROM_ENV')
=======
        self.access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
        self.secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
        self.secure = os.getenv('MINIO_SECURE', 'false').lower() == 'true'
        
        self._client = None
        self._enabled = HAS_MINIO and self.endpoint
    
    def _get_client(self) -> Optional['Minio']:
        """Get or create MinIO client"""
        if not self._enabled:
            return None
        
        if self._client is None:
            try:
                self._client = Minio(
                    self.endpoint,
                    access_key=self.access_key,
                    secret_key=self.secret_key,
                    secure=self.secure,
                )
            except Exception as e:
                print(f"⚠️ Failed to connect to MinIO: {e}")
                self._enabled = False
                return None
        
        return self._client
    
    def _get_bucket_name(self, workspace_id: str) -> str:
        """Get bucket name for a workspace (sanitized)"""
        # MinIO bucket names must be lowercase, no underscores
        return f"{workspace_id.lower().replace('_', '-')}-documents"
    
    async def ensure_bucket(self, workspace_id: str) -> bool:
        """Ensure bucket exists for workspace"""
        client = self._get_client()
        if not client:
            return False
        
        bucket_name = self._get_bucket_name(workspace_id)
        
        try:
            if not client.bucket_exists(bucket_name):
                client.make_bucket(bucket_name)
                print(f"✅ Created bucket: {bucket_name}")
            return True
        except S3Error as e:
            print(f"❌ Failed to create bucket: {e}")
            return False
    
    async def upload_file(
        self,
        workspace_id: str,
        file_content: bytes,
        file_name: str,
        content_type: str = "application/octet-stream",
    ) -> Optional[str]:
        """
        Upload a file to MinIO
        
        Args:
            workspace_id: Workspace ID (for isolation)
            file_content: File content as bytes
            file_name: Original file name
            content_type: MIME type
            
        Returns:
            Object name (file_id) or None if failed
        """
        client = self._get_client()
        if not client:
            return None
        
        # Ensure bucket exists
        if not await self.ensure_bucket(workspace_id):
            return None
        
        bucket_name = self._get_bucket_name(workspace_id)
        
        # Generate unique object name
        import uuid
        ext = os.path.splitext(file_name)[1]
        object_name = f"{uuid.uuid4()}{ext}"
        
        try:
            # Upload as bytes
            client.put_object(
                bucket_name=bucket_name,
                object_name=object_name,
                data=io.BytesIO(file_content),
                length=len(file_content),
                content_type=content_type,
            )
            return object_name
        except S3Error as e:
            print(f"❌ Failed to upload file: {e}")
            return None
    
    async def download_file(
        self,
        workspace_id: str,
        object_name: str,
    ) -> Optional[bytes]:
        """
        Download a file from MinIO
        
        Args:
            workspace_id: Workspace ID
            object_name: Object name (file_id)
            
        Returns:
            File content as bytes or None if failed
        """
        client = self._get_client()
        if not client:
            return None
        
        bucket_name = self._get_bucket_name(workspace_id)
        
        try:
            response = client.get_object(bucket_name, object_name)
            content = response.read()
            response.close()
            response.release_conn()
            return content
        except S3Error as e:
            print(f"❌ Failed to download file: {e}")
            return None
    
    async def download_to_tempfile(
        self,
        workspace_id: str,
        object_name: str,
    ) -> Optional[str]:
        """
        Download file to a temporary file
        
        Args:
            workspace_id: Workspace ID
            object_name: Object name
            
        Returns:
            Path to temporary file or None if failed
        """
        content = await self.download_file(workspace_id, object_name)
        if not content:
            return None
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(content)
            return tmp.name
    
    async def delete_file(
        self,
        workspace_id: str,
        object_name: str,
    ) -> bool:
        """Delete a file from MinIO"""
        client = self._get_client()
        if not client:
            return False
        
        bucket_name = self._get_bucket_name(workspace_id)
        
        try:
            client.remove_object(bucket_name, object_name)
            return True
        except S3Error as e:
            print(f"❌ Failed to delete file: {e}")
            return False
    
    async def file_exists(
        self,
        workspace_id: str,
        object_name: str,
    ) -> bool:
        """Check if file exists in MinIO"""
        client = self._get_client()
        if not client:
            return False
        
        bucket_name = self._get_bucket_name(workspace_id)
        
        try:
            client.stat_object(bucket_name, object_name)
            return True
        except S3Error:
            return False
    
    def is_enabled(self) -> bool:
        """Check if MinIO is enabled"""
        return self._enabled


# Import io for BytesIO
import io
