# AWS Credentials Setup for S3 Service

This guide explains how to set up AWS credentials for local development and production environments in a secure way.

---

## 1. Local Development

### Option 1: Using the `~/.aws/credentials` File
1. Create or edit the file at `~/.aws/credentials`.
2. Add the following content:
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```
3. (Optional) Add additional profiles if needed:
   ```ini
   [profile_name]
   aws_access_key_id = YOUR_ACCESS_KEY_FOR_PROFILE
   aws_secret_access_key = YOUR_SECRET_KEY_FOR_PROFILE
   ```
4. To use a specific profile, set the environment variable:
   ```bash
   export AWS_PROFILE=profile_name
   ```

### Option 2: Using Environment Variables
1. Set the following environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   export AWS_REGION=us-east-1
   ```

---

## 2. Production Environment

### Using IAM Roles (Recommended)

#### a) For EC2 Instances
1. **Create an IAM Role**:
    - Go to the AWS Management Console.
    - Create a role with **AWS Service -> EC2** as the trusted entity.
    - Attach the required permissions (e.g., `AmazonS3FullAccess`).

2. **Attach the Role to the Instance**:
    - In the EC2 dashboard, select the instance.
    - Choose **Actions -> Security -> Modify IAM role**.
    - Attach the created IAM role.

3. **Result**:
    - AWS SDK will automatically retrieve credentials from the EC2 instance metadata service.

#### b) For AWS Lambda
1. **Create a Lambda Execution Role**:
    - Similar to EC2, create a role with necessary permissions.

2. **Assign Role to Lambda Function**:
    - Attach the role to the Lambda function during creation or via the configuration page.

3. **Result**:
    - AWS Lambda automatically assumes the role and retrieves credentials.

---

## 3. Setting Up AWS CLI (Optional)
1. Run the following command:
   ```bash
   aws configure
   ```
2. Enter the following details when prompted:
    - AWS Access Key ID
    - AWS Secret Access Key
    - Default region (e.g., `us-east-1`)
    - Output format (e.g., `json`)

3. This creates:
    - `~/.aws/credentials` file for credentials.
    - `~/.aws/config` file for configurations.

---

## 4. Credential Loading Order
The AWS SDK prioritizes credentials in the following order:
1. **Environment variables**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
2. **Shared credentials file**: `~/.aws/credentials`.
3. **Shared configuration file**: `~/.aws/config`.
4. **Instance metadata service**: Used for IAM roles on EC2 or Lambda.

---

### Best Practices
- **Use IAM Roles in Production**: Avoid hardcoding credentials.
- **Rotate Keys Regularly**: Update `aws_access_key_id` and `aws_secret_access_key` periodically.
- **Grant Least Privilege**: Use scoped IAM policies to minimize access.
- **Monitor Usage**: Enable AWS CloudTrail to audit credential usage.

