'use server';

import {prisma} from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {createSession, deleteSession} from '@/lib/auth';
import {redirect} from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return {success: false, error: '이메일과 비밀번호를 입력해주세요.'};
    }

    const user = await prisma.user.findUnique({
        where: {email},
    });

    if (!user) {
        return {success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.'};
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return {success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.'};
    }

    await createSession(user.id, user.email, user.name);

    redirect('/admin');
}

export async function logout() {
    await deleteSession();
    return {success: true};
}
