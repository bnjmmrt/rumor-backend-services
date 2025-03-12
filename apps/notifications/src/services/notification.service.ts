import database from '../database';
import { Notification } from 'rumor-utils/shared/notifications/entities/notification.entity';
import { NotFoundError } from 'rumor-utils/errors';
import { Event } from 'rumor-utils/shared/events/entities'
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { In } from 'typeorm' 

class NotificationService {
    public dbConnection = database;

    async createNotification(
        title: string,
        message: string,
        body: object,
        notificationType: string,
        notificationModule: string,
        recipientIds: string[],
        linkedUserId?: string,
        linkedEventId?: string
    ): Promise<Notification> {
        return await this.dbConnection.connection.transaction(async (transactionalEntityManager) => {
            const notificationRepository = transactionalEntityManager.getRepository(Notification);
            const userRepository = transactionalEntityManager.getRepository(User);
            const eventRepository = transactionalEntityManager.getRepository(Event);
    
            const newNotification = notificationRepository.create({
                title,
                message,
                body,
                notificationType,
                notificationModule,
                linkedUser: linkedUserId ? await userRepository.findOne({ where: { id: linkedUserId } }) : null,
                linkedEvent: linkedEventId ? await eventRepository.findOne({ where: { id: linkedEventId } }) : null,
            });
    
            const savedNotification = await notificationRepository.save(newNotification);
    
            if (recipientIds.length > 0) {
                const recipients = await userRepository.find({where:{id: In(recipientIds)}});
                savedNotification.recipients = recipients;
                await notificationRepository.save(savedNotification);
            }
    
            return savedNotification;
        });
    }

    async getAllNotifications(
        recipientId: string, 
        take = 10, 
        skip = 0
    ): Promise<{ totalCount: number; notifications: Partial<Notification>[] }> {
        const queryBuilder = this.dbConnection.getRepository(Notification)
            .createQueryBuilder('notification')
            .innerJoin('notification.recipients', 'recipient', 'recipient.id = :recipientId', { recipientId })
            .select([
                'notification.id',
                'notification.title AS description',
                'notification.notificationType',
                'notification.created_at',
                'notification.message',
                'notification.body'
            ])
            .orderBy('notification.created_at', 'DESC');
    
        // Get total count without pagination
        const totalCount = await queryBuilder.getCount();
    
        // Apply pagination
        const notifications = await queryBuilder
            .take(take)
            .skip(skip)
            .getRawMany();
    
        return { totalCount, notifications };
    }


    async getNotificationDetail(notificationId: string): Promise<Notification> {
        // Fetch the notification
        const notification = await this.dbConnection.getRepository(Notification).findOne({
            where: { id: notificationId },
            relations: ['linkedUser', 'linkedEvent', 'recipients'], // Load relations if needed
        });

        // If notification is not found, throw an error
        if (!notification) {
            throw new NotFoundError('Notification not found');
        }

        // If isSeen is false, update it to true
        if (!notification.isSeen) {
            await this.dbConnection.getRepository(Notification).update(notificationId, { isSeen: true });
        }

        return notification;
    }

    async deleteNotification(notificationId: string): Promise<{ message: string }> {
        const result = await this.dbConnection.getRepository(Notification).delete(notificationId);

        if (result.affected === 0) {
            throw new NotFoundError('Notification not found');
        }

        return { message: 'Notification deleted successfully' };
    }


    async findAllNotifications(
        take = 10, 
        skip = 0, 
        notificationByModule?: string, 
        notificationByType?: string
    ): Promise<{ totalCount: number; notifications: Partial<Notification>[] }> {
        const queryBuilder = this.dbConnection.getRepository(Notification)
            .createQueryBuilder('notification')
            .select([
                'notification.id',
                'notification.title AS description',
                'notification.notificationType',
                'notification.notificationModule',
                'notification.created_at',
                'notification.message',
                'notification.body'
            ])
            .orderBy('notification.created_at', 'DESC');
    
        // Apply filters if provided
        if (notificationByModule) {
            queryBuilder.andWhere('notification.notificationModule = :notificationByModule', { notificationByModule });
        }
    
        if (notificationByType) {
            queryBuilder.andWhere('notification.notificationType = :notificationByType', { notificationByType });
        }
    
        // Get total count before pagination
        const totalCount = await queryBuilder.getCount();
    
        // Apply pagination
        const notifications = await queryBuilder
            .take(take)
            .skip(skip)
            .getRawMany();
    
        return { totalCount, notifications };
    }


    async getNotificationSummary(recipientId: string): Promise<{
        totalNotifications: number;
        notificationsByModule: Record<string, number>;
        notificationsByType: Record<string, number>;
    }> {
        const queryBuilder = this.dbConnection.getRepository(Notification)
            .createQueryBuilder('notification')
            .innerJoin('notification.recipients', 'recipient', 'recipient.id = :recipientId', { recipientId });
    
        // Get total notifications count
        const totalNotifications = await queryBuilder.getCount();
    
        // Get count grouped by notificationModule
        const notificationsByModule = await queryBuilder
            .select('notification.notificationModule, COUNT(*) AS count')
            .groupBy('notification.notificationModule')
            .getRawMany();
    
        // Get count grouped by notificationType
        const notificationsByType = await queryBuilder
            .select('notification.notificationType, COUNT(*) AS count')
            .groupBy('notification.notificationType')
            .getRawMany();
    
        // Format response
        return {
            totalNotifications,
            notificationsByModule: notificationsByModule.reduce((acc, row) => {
                acc[row.notificationModule] = Number(row.count);
                return acc;
            }, {} as Record<string, number>),
            notificationsByType: notificationsByType.reduce((acc, row) => {
                acc[row.notificationType] = Number(row.count);
                return acc;
            }, {} as Record<string, number>),
        };
    }

    async deleteMultipleNotifications(recipientId: string, notificationIds: string[]): Promise<{ deletedCount: number }> {
        if (!notificationIds || notificationIds.length === 0) {
            throw new Error('No notification IDs provided.');
        }
    
        const result = await this.dbConnection.getRepository(Notification)
            .createQueryBuilder()
            .delete()
            .from(Notification)
            .where('id IN (:...notificationIds)', { notificationIds })
            .andWhere('id IN (SELECT nr.notification_id FROM notification_recipients nr WHERE nr.user_id = :recipientId)', { recipientId })
            .execute();
    
        return { deletedCount: result.affected || 0 };
    }
}

const notificationSerice = new NotificationService()
export default notificationSerice;